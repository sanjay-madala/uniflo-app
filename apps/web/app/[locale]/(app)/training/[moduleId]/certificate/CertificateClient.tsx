"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTrainingModuleData, useTrainingCertificatesData } from "@/lib/data/useTrainingData";
import type {
  TrainingModule,
  TrainingCertificate,
  TrainingEnrollment,
} from "@uniflo/mock-data";
import { Button } from "@uniflo/ui";
import { Download, Share2, ArrowLeft } from "lucide-react";
import { CertificateDownload } from "@/components/training/CertificateDownload";
import { ModuleCard } from "@/components/training/ModuleCard";

const CURRENT_USER = "user_001";

export default function CertificateClient() {
  const { locale, moduleId } = useParams<{ locale: string; moduleId: string }>();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const { module, enrollment } = useTrainingModuleData(moduleId, CURRENT_USER);
  const { data: allCertificates, modules: allModules, enrollments: allEnrollments } = useTrainingCertificatesData();

  const certificate = enrollment?.certificate_id
    ? allCertificates.find((c) => c.id === enrollment.certificate_id) ?? null
    : null;

  // Related modules (same category, exclude this one and completed ones)
  const completedModuleIds = useMemo(() => {
    return new Set(
      allEnrollments
        .filter((e) => e.user_id === CURRENT_USER && e.status === "completed")
        .map((e) => e.module_id)
    );
  }, [allEnrollments]);

  const relatedModules = useMemo(() => {
    if (!module) return [];
    return allModules
      .filter(
        (m) =>
          m.id !== module.id &&
          m.status === "published" &&
          !completedModuleIds.has(m.id) &&
          (m.category === module.category ||
            m.assigned_role_ids.some((r) => module.assigned_role_ids.includes(r)))
      )
      .slice(0, 3);
  }, [module, completedModuleIds, allModules]);

  if (!module) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Module not found</h2>
        <Link href={`/${locale}/training/`}>
          <Button variant="secondary">Back to Training Library</Button>
        </Link>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
          Complete the quiz to earn your certificate
        </h2>
        <Link href={`/${locale}/training/${moduleId}/quiz/`}>
          <Button>Go to Quiz</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Breadcrumb */}
      <div className="px-6 py-3 border-b border-[var(--border-default)]">
        <nav className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <Link href={`/${locale}/training/`} className="hover:text-[var(--accent-blue)] transition-colors">
            Training
          </Link>
          <span>/</span>
          <Link href={`/${locale}/training/${moduleId}/`} className="hover:text-[var(--accent-blue)] transition-colors truncate">
            {module.title}
          </Link>
          <span>/</span>
          <span className="text-[var(--text-primary)] font-medium">Certificate</span>
        </nav>
      </div>

      <div className="p-6 max-w-3xl mx-auto w-full">
        {/* Confetti */}
        {showConfetti && (
          <div className="text-center mb-4 text-5xl motion-reduce:hidden" aria-hidden="true">
            🎉 🎊 🏆
          </div>
        )}

        {/* Certificate card */}
        <div className="mb-8" style={{ opacity: 1, transition: "opacity 300ms" }}>
          <CertificateDownload certificate={certificate} />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <Button size="sm" onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-1" /> Download PDF
          </Button>
          <Button variant="secondary" size="sm">
            <Share2 className="h-4 w-4 mr-1" /> Share
          </Button>
          <Link href={`/${locale}/training/`}>
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Training
            </Button>
          </Link>
        </div>

        {/* What's Next */}
        {relatedModules.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
              What&apos;s Next?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedModules.map((mod) => (
                <ModuleCard key={mod.id} module={mod} compact />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
