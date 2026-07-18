import os
import sys
import types

# 1. FIX: Mock the missing legacy VertexAI path BEFORE importing ragas
fake_vertex_module = types.ModuleType("vertexai")
fake_vertex_module.ChatVertexAI = object
sys.modules["langchain_community.chat_models.vertexai"] = fake_vertex_module

# 2. Rest of your original imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from langchain_core.documents import Document
from services.ingestion import ParserFactory, ChunkingFactory, EMBEDDINGS
from ragas.testset import TestsetGenerator  # Now this will import successfully!
from dotenv import load_dotenv
from langchain_groq import ChatGroq
import pandas as pd

load_dotenv()

# Parse the docs
parser = ParserFactory.call_parser("/Users/venky/Synapse/evaluation/test_docs/sample_lecture_notes.pdf")
parsed_content = parser.parse()

doc = Document(
    page_content=parsed_content["content"],
    metadata={"source": parsed_content["file_name"]}
)

# Generator llm
generator_llm = ChatGroq(
    model="openai/gpt-oss-20b",
    api_key=os.getenv("GROQ_API_KEY"),
)

# Initialise the generator
generator = TestsetGenerator.from_langchain(
    llm=generator_llm,
    embedding_model=EMBEDDINGS
)

# Generate test set
generated_test_set = generator.generate_with_langchain_docs(
    documents=[doc],
    testset_size=10
)

generated_test_set_df = generated_test_set.to_pandas()

# 3. FIX: Removed variable assignment from .to_csv() as it returns None
generated_test_set_df.to_csv("test_set.csv", index=False)

print("generated test set successfully saved to test_set.csv")
