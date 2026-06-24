from pptx import Presentation

class PPTParser:
    def __init__(self, ppt_path):
        self.ppt_path = ppt_path
        self.ppt = Presentation(self.ppt_path)

    # function to parse the ppt
    def parse(self):
        content = ""
        for slide_num, slide in enumerate(self.ppt.slides, start=1):
            content += f"[SLIDE {slide_num}] "
            for shape in slide.shapes:
                if shape.has_text_frame:
                    for paragraph in shape.text_frame.paragraphs:
                        text = paragraph.text
                        cleaned_text = " ".join(text.split())
                        content += cleaned_text + " "

        return {
            "file_name": self.ppt_path,
            "file_type": "pptx",
            "content": content
        }