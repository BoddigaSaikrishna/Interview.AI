import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Upload,
  X,
  CheckCircle2,
  Loader2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

interface ResumeUploadProps {
  onResumeExtracted: (text: string | null) => void;
  resumeText: string | null;
}

async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');

  // Use the bundled worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url,
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    pages.push(pageText);
  }

  return pages.join('\n\n').trim();
}

function detectSkills(text: string): string[] {
  const skillKeywords = [
    'Python', 'Java', 'JavaScript', 'TypeScript', 'C\\+\\+', 'C#', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
    'React', 'Angular', 'Vue', 'Node\\.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'Next\\.js',
    'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase', 'Supabase',
    'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD',
    'Git', 'REST API', 'GraphQL', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch',
    'HTML', 'CSS', 'Tailwind', 'SASS', 'Bootstrap',
    'Agile', 'Scrum', 'JIRA', 'Figma', 'Linux',
    'Data Structures', 'Algorithms', 'System Design', 'OOP',
  ];

  const found: string[] = [];
  for (const skill of skillKeywords) {
    const regex = new RegExp(`\\b${skill}\\b`, 'i');
    if (regex.test(text)) {
      // Use the canonical casing from our list
      found.push(skill.replace(/\\\+/g, '+').replace(/\\\./g, '.'));
    }
  }

  return [...new Set(found)].slice(0, 15);
}

export default function ResumeUpload({ onResumeExtracted, resumeText }: ResumeUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [detectedSkills, setDetectedSkills] = useState<string[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    // Validate file type
    if (file.type !== 'application/pdf') {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF file.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a PDF smaller than 10MB.',
        variant: 'destructive',
      });
      return;
    }

    setIsParsing(true);
    setParseError(null);
    setFileName(file.name);

    try {
      const text = await extractTextFromPDF(file);

      if (!text || text.length < 50) {
        setParseError('Could not extract enough text. The PDF may be image-based or empty.');
        toast({
          title: 'Low text content',
          description: 'Could not extract much text from this PDF. It may be a scanned image. Try a text-based PDF.',
          variant: 'destructive',
        });
        setIsParsing(false);
        return;
      }

      const skills = detectSkills(text);
      setDetectedSkills(skills);
      onResumeExtracted(text);

      toast({
        title: '✅ Resume parsed successfully!',
        description: `Extracted ${text.length.toLocaleString()} characters. ${skills.length} skills detected.`,
      });
    } catch (err) {
      console.error('PDF parsing error:', err);
      setParseError('Failed to parse the PDF. Please try a different file.');
      toast({
        title: 'Parsing failed',
        description: 'Could not read the PDF file. Please try another resume.',
        variant: 'destructive',
      });
    } finally {
      setIsParsing(false);
    }
  }, [onResumeExtracted, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset so the same file can be re-selected
    e.target.value = '';
  }, [handleFile]);

  const handleClear = useCallback(() => {
    setFileName(null);
    setDetectedSkills([]);
    setParseError(null);
    onResumeExtracted(null);
  }, [onResumeExtracted]);

  const isUploaded = !!resumeText;

  return (
    <Card className="shadow-card border-0 overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Resume Upload
          <span className="text-xs font-normal text-muted-foreground ml-auto px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            Optional
          </span>
        </CardTitle>
        <CardDescription>
          Upload your resume for personalized interview questions based on your skills & experience
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isUploaded ? (
          /* ── Drop Zone ──────────────────────────────────────── */
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !isParsing && fileInputRef.current?.click()}
            className={`
              relative cursor-pointer rounded-2xl border-2 border-dashed
              transition-all duration-300 ease-out
              flex flex-col items-center justify-center
              py-10 px-6 text-center
              group
              ${isDragOver
                ? 'border-primary bg-primary/10 scale-[1.02] shadow-lg shadow-primary/20'
                : 'border-border hover:border-primary/50 hover:bg-primary/5'
              }
              ${isParsing ? 'pointer-events-none opacity-70' : ''}
            `}
          >
            {/* Animated background gradient on hover */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

            {isParsing ? (
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <p className="font-semibold text-foreground">Parsing your resume...</p>
                <p className="text-sm text-muted-foreground">{fileName}</p>
              </div>
            ) : parseError ? (
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-destructive" />
                </div>
                <p className="font-semibold text-destructive">{parseError}</p>
                <p className="text-sm text-muted-foreground">Click to try another file</p>
              </div>
            ) : (
              <div className="relative z-10 flex flex-col items-center gap-3">
                <div className={`
                  w-16 h-16 rounded-2xl flex items-center justify-center
                  transition-all duration-300
                  ${isDragOver
                    ? 'bg-primary/20 scale-110'
                    : 'bg-primary/10 group-hover:bg-primary/15 group-hover:scale-105'
                  }
                `}>
                  <Upload className={`w-8 h-8 transition-colors duration-300 ${isDragOver ? 'text-primary' : 'text-primary/70 group-hover:text-primary'}`} />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {isDragOver ? 'Drop your resume here!' : 'Drag & drop your resume'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    or <span className="text-primary font-medium underline underline-offset-2">browse files</span> • PDF only, max 10MB
                  </p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>
        ) : (
          /* ── Uploaded State ────────────────────────────────── */
          <div className="space-y-4">
            {/* File info bar */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-emerald-700 dark:text-emerald-400 truncate">
                  {fileName || 'Resume uploaded'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {resumeText.length.toLocaleString()} characters extracted
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="text-muted-foreground hover:text-destructive flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Detected Skills */}
            {detectedSkills.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Skills detected from your resume</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {detectedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium
                        bg-primary/10 text-primary border border-primary/20
                        transition-all duration-200 hover:bg-primary/20 hover:scale-105"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Resume text preview */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Preview</p>
              <div className="max-h-28 overflow-y-auto rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground leading-relaxed font-mono">
                {resumeText.slice(0, 600)}
                {resumeText.length > 600 && '...'}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
