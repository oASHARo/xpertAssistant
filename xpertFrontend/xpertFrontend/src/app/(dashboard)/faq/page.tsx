import { Card } from "@/components/ui/card";

const FAQS = [
  {
    question: "How does Xpert Assistant score candidates?",
    answer:
      "Each job's criteria (defined in Set Criteria, either AI-generated or manual) are compared against each uploaded resume to produce Experience, Skills, and Education scores.",
  },
  {
    question: "What file types can I upload?",
    answer: "PDF and DOCX resumes are supported, up to 5MB per file.",
  },
  {
    question: "Can I edit criteria after generating them?",
    answer:
      "Yes — every generated criterion's \"Ideal answer\" field is editable, and you can add or remove criteria before saving.",
  },
];

export default function FaqPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">FAQ&apos;s</h1>

      <div className="mt-6 max-w-2xl space-y-3">
        {FAQS.map((faq) => (
          <Card key={faq.question} className="p-4">
            <h3 className="text-sm font-semibold text-gray-900">{faq.question}</h3>
            <p className="mt-1.5 text-sm text-gray-500">{faq.answer}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}