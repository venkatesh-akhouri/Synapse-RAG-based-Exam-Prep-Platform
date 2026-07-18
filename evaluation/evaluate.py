import os
import sys
import types
import asyncio
import pandas as pd
from dotenv import load_dotenv
from tabulate import tabulate
# =====================================================================
# SYSTEM DESIGN: Mocking legacy imports to bypass third-party library bugs
# =====================================================================
fake_vertex_module = types.ModuleType("vertexai")
fake_vertex_module.ChatVertexAI = object
sys.modules["langchain_community.chat_models.vertexai"] = fake_vertex_module

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import Ragas and LangChain components
from datasets import Dataset
from ragas import evaluate
from ragas.metrics import Faithfulness, AnswerRelevancy, ContextPrecision, ContextRecall
from langchain_groq import ChatGroq

# Import the Ragas adapters for LangChain compatibility
from ragas.llms import LangchainLLMWrapper
from ragas.embeddings import LangchainEmbeddingsWrapper

# Import custom production pipeline components
from services.retreival import retrieve
from services.llm import get_answer
from DataIngestion.embedder import Embedder
from services.ingestion import EMBEDDINGS

load_dotenv()

# Initialize custom database client
embedder = Embedder(EMBEDDINGS)

# Initialize the Ragas Judge LLM (Using Llama-3.3 on Groq as our free judge)
judge_llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY")
)

# =====================================================================
# COMPATIBILITY WRAPPERS: Convert LangChain classes to Ragas-native interfaces
# =====================================================================
ragas_judge = LangchainLLMWrapper(judge_llm)
ragas_embeddings = LangchainEmbeddingsWrapper(EMBEDDINGS)


async def run_evaluation():
    # 1. Load your gold standard test set from Stage 1
    csv_path = "/Users/venky/Synapse/evaluation/test_set.csv"
    if not os.path.exists(csv_path):
        print(f"Error: Could not find test set at {csv_path}. Please run generate_test_set.py first.")
        return
    
    df_test = pd.read_csv(csv_path)
    print(f"Loaded {len(df_test)} test cases from {csv_path}\n")
    
    # These lists will store our collected pipeline data
    questions = []
    answers = []
    contexts = []
    ground_truths = []
    
    # 2. Loop through each question to execute your custom RAG pipeline
    for index, row in df_test.iterrows():
        question = row['user_input']
        ground_truth = row['reference']
        print(f"Processing Query {index + 1}/{len(df_test)}: '{question}'")
        
        # Run custom retrieval (local DB query)
        retrieval_results = retrieve(question, embedder.collection)
        retrieved_chunks = retrieval_results['chunks']
        
        # Run your custom LLM generation (async Groq call)
        try:
            generated_answer = await get_answer(question, retrieved_chunks)
        except Exception as e:
            print(f"Generation failed for this query: {e}")
            generated_answer = "Error: Failed to generate answer."
        
        # Collect the data for the Ragas dictionary
        questions.append(question)
        answers.append(generated_answer)
        contexts.append(retrieved_chunks)  # List of lists of chunks
        ground_truths.append(ground_truth)
    
    # Format the collected data into the exact 4-key dictionary Ragas expects
    data_dict = {
        "question": questions,
        "answer": answers,
        "contexts": contexts,
        "ground_truth": ground_truths
    }
    
    # Convert to Hugging Face Dataset format
    dataset = Dataset.from_dict(data_dict)
    
    print("\nRunning Ragas Evaluation (Faithfulness, Relevance, Recall, Precision)...")
    
    # 3. Execute the evaluation (Metrics are individually configured with wrapped components)
    results = evaluate(
        dataset=dataset,
        metrics=[
            Faithfulness(llm=ragas_judge),
            AnswerRelevancy(llm=ragas_judge, embeddings=ragas_embeddings),
            ContextPrecision(llm=ragas_judge),
            ContextRecall(llm=ragas_judge)
        ]
    )
    
    # 4. Output and Save the Performance Scorecard
    print("\n=== Ragas Performance Scorecard ===")
    df_results = results.to_pandas()
    
    # Print results to the console (Updated name to answer_relevancy)
    print(tabulate(df_results, headers="keys", tablefmt="psql"))
    
    report_path = "/Users/venky/Synapse/evaluation/evaluation_report.csv"
    df_results.to_csv(report_path, index=False)
    print(f"\nSUCCESS: Evaluation complete. Report saved to {report_path}")


if __name__ == "__main__":
    # Execute the main async event loop
    asyncio.run(run_evaluation())