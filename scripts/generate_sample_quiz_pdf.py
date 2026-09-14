from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


OUTPUT = Path(__file__).resolve().parents[1] / "sample-ai-quiz-source.pdf"


LINES = [
    "AI Quiz Generator Test Paper",
    "",
    "Course: BDS 2nd Year",
    "Topic: Oral Anatomy and Dental Histology",
    "",
    "Instructions:",
    "Read each question carefully and choose the correct answer.",
    "",
    "1. Which cells are primarily responsible for enamel formation?",
    "A. Odontoblasts",
    "B. Ameloblasts",
    "C. Cementoblasts",
    "D. Osteoblasts",
    "",
    "2. The hardest substance in the human body is:",
    "A. Dentin",
    "B. Cementum",
    "C. Enamel",
    "D. Pulp",
    "",
    "3. Dentin is formed by:",
    "A. Ameloblasts",
    "B. Fibroblasts",
    "C. Odontoblasts",
    "D. Osteoclasts",
    "",
    "4. Which part of the tooth contains blood vessels and nerves?",
    "A. Enamel",
    "B. Pulp",
    "C. Cementum",
    "D. Dentin",
    "",
    "Answer Key:",
    "1. B - Ameloblasts produce enamel during tooth development.",
    "2. C - Enamel is the hardest tissue in the human body.",
    "3. C - Odontoblasts are responsible for dentin formation.",
    "4. B - The pulp contains nerves and blood vessels.",
]


def write_wrapped_line(pdf: canvas.Canvas, text: str, x: int, y: int, max_width: int, font_name: str, font_size: int) -> int:
    words = text.split()
    if not words:
        return y - 18

    current = words[0]
    for word in words[1:]:
        candidate = f"{current} {word}"
        if stringWidth(candidate, font_name, font_size) <= max_width:
            current = candidate
        else:
            pdf.drawString(x, y, current)
            y -= 18
            current = word
    pdf.drawString(x, y, current)
    return y - 18


def main() -> None:
    pdf = canvas.Canvas(str(OUTPUT), pagesize=A4)
    width, height = A4
    x = 56
    y = height - 60
    max_width = width - 112

    for index, line in enumerate(LINES):
        if index == 0:
            pdf.setFont("Helvetica-Bold", 18)
            pdf.drawString(x, y, line)
            y -= 28
            pdf.setFont("Helvetica", 12)
            continue

        if y < 70:
            pdf.showPage()
            pdf.setFont("Helvetica", 12)
            y = height - 60

        y = write_wrapped_line(pdf, line, x, y, max_width, "Helvetica", 12)

    pdf.save()
    print(OUTPUT)


if __name__ == "__main__":
    main()
