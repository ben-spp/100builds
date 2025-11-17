'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import FormProgress from '@/components/FormProgress';
import FormField from '@/components/FormField';
import TagInput from '@/components/TagInput';
import CategorySelector from '@/components/CategorySelector';
import ImageUpload from '@/components/ImageUpload';
import CardPreview from '@/components/CardPreview';
import SubmitModal from '@/components/SubmitModal';
import LinkAccordion from '@/components/LinkAccordion';
import { ProjectType } from '@/types/project';

function NewProjectForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = (searchParams.get('mode') || 'show') as ProjectType;

  const STORAGE_KEY = '100builds_draft';

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    avatar: '',
    featuredImage: '',
    tags: [] as string[],
    category: '',
    needHelpWith: '',
    // Core links
    site: '',
    github: '',
    threads: '',
    twitter: '',
    linkedin: '',
    // Creative & design
    dribbble: '',
    behance: '',
    instagram: '',
    // Maker & indie
    indiehackers: '',
    producthunt: '',
    reddit: '',
    // Optional extras
    youtube: '',
    blog: '',
    discord: '',
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
      } catch (e) {
        console.error('Failed to parse saved form data', e);
      }
    }
  }, []);

  // Save to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const [showModal, setShowModal] = useState(false);
  const [projectSlug, setProjectSlug] = useState('');
  const [projectNumber, setProjectNumber] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  const categories = ['app', 'web app', 'concept'];
  const helpOptions = ['design', 'development', 'marketing', 'funding', 'exposure', 'other'];

  // Calculate field completion
  const getCompletedFields = () => {
    const step1Fields = [
      formData.name,
      formData.description,
      formData.avatar,
      formData.tags.length > 0 ? 'yes' : '',
      formData.category,
    ];

    if (mode === 'help') {
      step1Fields.push(formData.needHelpWith);
    }

    // Count all links as just 1 field
    const hasAnyLink = !!(
      formData.site || formData.github || formData.threads || formData.twitter ||
      formData.linkedin || formData.dribbble || formData.behance || formData.instagram ||
      formData.indiehackers || formData.producthunt || formData.reddit ||
      formData.youtube || formData.blog || formData.discord
    );

    const step1Completed = step1Fields.filter(f => f).length;
    const step2Completed = hasAnyLink ? 1 : 0;

    return [step1Completed, step2Completed];
  };

  const stepFieldCounts = mode === 'help' ? [6, 1] : [5, 1];
  const completedFields = getCompletedFields();

  const slugify = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Check slug availability when name changes
  useEffect(() => {
    const checkSlug = async () => {
      if (!formData.name.trim()) {
        setSlugAvailable(null);
        return;
      }

      const slug = slugify(formData.name);
      if (!slug) {
        setSlugAvailable(null);
        return;
      }

      setCheckingSlug(true);
      try {
        const response = await fetch(`/api/check-slug?slug=${encodeURIComponent(slug)}`);
        const data = await response.json();
        setSlugAvailable(data.available);
      } catch (error) {
        console.error('Error checking slug:', error);
        setSlugAvailable(null);
      } finally {
        setCheckingSlug(false);
      }
    };

    // Debounce the check
    const timeout = setTimeout(checkSlug, 500);
    return () => clearTimeout(timeout);
  }, [formData.name]);

  const handleNext = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToStep2 = formData.name && formData.description && (mode === 'show' || formData.needHelpWith);

  const handleImageUpload = async (file: File): Promise<string> => {
    if (!formData.name.trim()) {
      throw new Error('Please enter a project name first');
    }

    const slug = slugify(formData.name);
    if (!slug) {
      throw new Error('Please enter a valid project name first');
    }

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('slug', slug);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: uploadFormData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const data = await response.json();
    setFormData({ ...formData, avatar: data.url });
    return data.url;
  };

  const handleFeaturedImageUpload = async (file: File): Promise<string> => {
    if (!formData.name.trim()) {
      throw new Error('Please enter a project name first');
    }

    const slug = slugify(formData.name);
    if (!slug) {
      throw new Error('Please enter a valid project name first');
    }

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('slug', slug);
    uploadFormData.append('type', 'featured');

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: uploadFormData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const data = await response.json();
    setFormData({ ...formData, featuredImage: data.url });
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const slug = slugify(formData.name);

    const project = {
      id: Date.now().toString(),
      slug,
      type: mode,
      name: formData.name,
      description: formData.description,
      avatar: formData.avatar || undefined,
      featuredImage: formData.featuredImage || undefined,
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      category: formData.category,
      needs: mode === 'help' ? formData.needHelpWith : undefined,
      links: {
        site: formData.site || undefined,
        github: formData.github || undefined,
        threads: formData.threads || undefined,
        twitter: formData.twitter || undefined,
        linkedin: formData.linkedin || undefined,
        dribbble: formData.dribbble || undefined,
        behance: formData.behance || undefined,
        instagram: formData.instagram || undefined,
        indiehackers: formData.indiehackers || undefined,
        producthunt: formData.producthunt || undefined,
        reddit: formData.reddit || undefined,
        youtube: formData.youtube || undefined,
        blog: formData.blog || undefined,
        discord: formData.discord || undefined,
      },
      date: new Date().toISOString().split('T')[0],
    };

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project),
      });

      if (response.ok) {
        // Clear localStorage on successful submission
        localStorage.removeItem(STORAGE_KEY);
        // Redirect directly to build page where claim modal will appear
        router.push(`/build/${slug}`);
      }
    } catch (error) {
      console.error('Error submitting project:', error);
      alert('Failed to submit project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-surface-0">
      {/* Header */}
      <header className="relative top-0 left-0 right-0 z-40 bg-surface-0/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <svg className="w-6 h-7 text-text-primary" viewBox="0 0 78 88" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M0 62.86V22.65C0 21.94 0.38 21.3 0.98 20.96L35.89 0.83C37.81 -0.28 40.19 -0.28 42.11 0.83L77.02 20.96C77.62 21.3 78 21.94 78 22.65V62.86C78 65.11 76.8 67.18 74.85 68.3L42.14 87.16C40.2 88.28 37.8 88.28 35.86 87.16C35.86 87.16 19.5 77.73 19.49 77.72L3.15 68.3C1.2 67.18 0 65.11 0 62.86ZM3.92 26.04V42.92L18.52 51.35V34.46L3.92 26.04ZM74.08 26.04L59.48 34.46V51.35L74.08 42.92V26.04ZM57.43 31.12L72.13 22.65L57.6 14.28L42.91 22.75L57.43 31.12ZM53.69 12.02L40.15 4.22C39.44 3.81 38.56 3.81 37.85 4.22L24.31 12.02L39 20.49L53.69 12.02ZM20.4 14.28L5.87 22.65L20.57 31.12L35.09 22.75L20.4 14.28ZM59.48 72.65L72.9 64.91C73.63 64.49 74.08 63.71 74.08 62.86V47.44L59.48 55.86L59.48 72.65ZM22.44 74.91L37.04 83.33V66.54L22.44 58.12V74.91ZM40.96 83.33L55.56 74.91V58.12L40.96 66.54V83.33ZM3.92 47.44V62.86C3.92 63.71 4.37 64.49 5.1 64.91L18.52 72.65V55.86L3.92 47.44ZM22.44 36.71V53.6L37.04 62.02V44.99C36.64 44.85 36.26 44.68 35.89 44.47L22.44 36.71ZM55.56 53.6V36.71L42.11 44.47C41.74 44.68 41.36 44.85 40.96 44.99V62.02L55.56 53.6ZM24.48 33.38L37.85 41.08C38.56 41.49 39.44 41.49 40.16 41.08L53.52 33.38L39 25.01L24.48 33.38Z" fill="currentColor"/>
            </svg>
            <span className="text-xl font-semibold text-text-primary">100builds</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Header Section */}
      <div className="pt-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-black text-text-primary mb-4">
              {mode === 'show' ? 'Share your build' : 'Find help for your build'}
            </h1>
            <p className="text-text-secondary text-lg">
              {mode === 'show'
                ? 'Showcase your creation with the world'
                : 'Let the community know what you need help with'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Form Progress - Full Width Sticky on mobile */}
      <div className="lg:hidden sticky top-0 z-30 mb-12 backdrop-blur-md bg-surface-0/95">
        <FormProgress
          currentStep={currentStep}
          totalSteps={2}
          stepFieldCounts={stepFieldCounts}
          completedFields={completedFields}
          transparent
        />
      </div>

      {/* Form Progress - Full Width Sticky on desktop */}
      <div className="hidden lg:block sticky top-0 z-30 bg-surface-0 shadow-sm mb-12">
        <FormProgress
          currentStep={currentStep}
          totalSteps={2}
          stepFieldCounts={stepFieldCounts}
          completedFields={completedFields}
        />
      </div>

      {/* Form Section */}
      <div className="pb-12 px-4 overflow-visible">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Form */}
              <div className="space-y-6">
                {/* Step 1: Project Details */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <FormField
                        label="Project Name"
                        name="name"
                        value={formData.name}
                        onChange={(value) => setFormData({ ...formData, name: value })}
                        placeholder="Enter the name of your build"
                        required
                        error={slugAvailable === false}
                      />
                      {formData.name && (
                        <div className="mt-2">
                          {checkingSlug ? (
                            <p className="text-sm text-text-muted">Checking availability...</p>
                          ) : slugAvailable === false ? (
                            <p className="text-sm text-red-500">⚠️ This project name is not available</p>
                          ) : slugAvailable === true ? (
                            <p className="text-sm text-green-500">✓ Project name is available</p>
                          ) : null}
                        </div>
                      )}
                    </div>

                    <FormField
                      label="Description"
                      name="description"
                      type="textarea"
                      value={formData.description}
                      onChange={(value) => setFormData({ ...formData, description: value })}
                      placeholder="Describe what you're building and what makes it unique..."
                      required
                    />

                    <ImageUpload
                      label="Project Avatar"
                      currentImage={formData.avatar}
                      onUpload={handleImageUpload}
                      slug={slugify(formData.name) || 'temp'}
                      description="Square images work best (200x200px recommended)"
                    />

                    <ImageUpload
                      label="Featured Image (1024x768px recommended)"
                      currentImage={formData.featuredImage}
                      onUpload={handleFeaturedImageUpload}
                      slug={slugify(formData.name) || 'temp'}
                      description="Landscape images work best (1024x768px recommended)"
                    />

                    <TagInput
                      label="Tags"
                      tags={formData.tags}
                      onChange={(tags) => setFormData({ ...formData, tags })}
                      placeholder="Add up to 4 relevant tags..."
                      maxTags={4}
                    />

                    <CategorySelector
                      label="Category"
                      value={formData.category}
                      onChange={(value) => setFormData({ ...formData, category: value })}
                      options={categories}
                    />

                    {mode === 'help' && (
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-text-secondary">
                          Need help with <span className="text-primary">*</span>
                        </label>
                        <select
                          value={formData.needHelpWith}
                          onChange={(e) => setFormData({ ...formData, needHelpWith: e.target.value })}
                          className="w-full px-4 py-3 bg-surface-1 border border-border rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                          required
                        >
                          <option value="">Select...</option>
                          {helpOptions.map((option) => (
                            <option key={option} value={option}>
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!canProceedToStep2 || slugAvailable === false}
                      className="w-full px-6 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next: Add Links
                    </button>
                  </div>
                )}

                {/* Step 2: Links */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="p-4 bg-surface-1 border border-border rounded-xl">
                      <h3 className="text-lg font-bold text-text-primary mb-1">Links (optional)</h3>
                      <p className="text-sm text-text-muted">Add relevant links to your project</p>
                    </div>

                    {/* Core identity & project links - Open by default */}
                    <LinkAccordion title="Core identity & project links" description="Your live app or landing page" defaultOpen={true}>
                      <FormField
                        label="🌐 Website"
                        name="site"
                        type="url"
                        value={formData.site}
                        onChange={(value) => setFormData({ ...formData, site: value })}
                        placeholder="https://yourapp.com"
                      />

                      <FormField
                        label="💻 GitHub"
                        name="github"
                        type="url"
                        value={formData.github}
                        onChange={(value) => setFormData({ ...formData, github: value })}
                        placeholder="https://github.com/username/repo"
                      />

                      <FormField
                        label="🧵 Threads"
                        name="threads"
                        type="url"
                        value={formData.threads}
                        onChange={(value) => setFormData({ ...formData, threads: value })}
                        placeholder="https://threads.net/@username"
                      />

                      <FormField
                        label="🐦 X / Twitter"
                        name="twitter"
                        type="url"
                        value={formData.twitter}
                        onChange={(value) => setFormData({ ...formData, twitter: value })}
                        placeholder="https://x.com/username"
                      />

                      <FormField
                        label="💬 LinkedIn"
                        name="linkedin"
                        type="url"
                        value={formData.linkedin}
                        onChange={(value) => setFormData({ ...formData, linkedin: value })}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </LinkAccordion>

                    {/* Creative & design community */}
                    <LinkAccordion title="Creative & design community" description="Product shots, UI teasers, case studies">
                      <FormField
                        label="🎨 Dribbble"
                        name="dribbble"
                        type="url"
                        value={formData.dribbble}
                        onChange={(value) => setFormData({ ...formData, dribbble: value })}
                        placeholder="https://dribbble.com/username"
                      />

                      <FormField
                        label="🧠 Behance"
                        name="behance"
                        type="url"
                        value={formData.behance}
                        onChange={(value) => setFormData({ ...formData, behance: value })}
                        placeholder="https://behance.net/username"
                      />

                      <FormField
                        label="📸 Instagram"
                        name="instagram"
                        type="url"
                        value={formData.instagram}
                        onChange={(value) => setFormData({ ...formData, instagram: value })}
                        placeholder="https://instagram.com/username"
                      />
                    </LinkAccordion>

                    {/* Maker & indie ecosystems */}
                    <LinkAccordion title="Maker & indie ecosystems" description="Launch posts, devlogs, community threads">
                      <FormField
                        label="🚀 Indie Hackers"
                        name="indiehackers"
                        type="url"
                        value={formData.indiehackers}
                        onChange={(value) => setFormData({ ...formData, indiehackers: value })}
                        placeholder="https://indiehackers.com/product/yourapp"
                      />

                      <FormField
                        label="📈 Product Hunt"
                        name="producthunt"
                        type="url"
                        value={formData.producthunt}
                        onChange={(value) => setFormData({ ...formData, producthunt: value })}
                        placeholder="https://producthunt.com/posts/yourapp"
                      />

                      <FormField
                        label="💬 Reddit"
                        name="reddit"
                        type="url"
                        value={formData.reddit}
                        onChange={(value) => setFormData({ ...formData, reddit: value })}
                        placeholder="https://reddit.com/r/yoursubreddit"
                      />
                    </LinkAccordion>

                    {/* Optional extras */}
                    <LinkAccordion title="Optional extras" description="Demos, devlogs, community spaces">
                      <FormField
                        label="📺 YouTube"
                        name="youtube"
                        type="url"
                        value={formData.youtube}
                        onChange={(value) => setFormData({ ...formData, youtube: value })}
                        placeholder="https://youtube.com/@username"
                      />

                      <FormField
                        label="📚 Blog / Medium / Substack"
                        name="blog"
                        type="url"
                        value={formData.blog}
                        onChange={(value) => setFormData({ ...formData, blog: value })}
                        placeholder="https://yourblog.com"
                      />

                      <FormField
                        label="💬 Discord / Slack"
                        name="discord"
                        type="url"
                        value={formData.discord}
                        onChange={(value) => setFormData({ ...formData, discord: value })}
                        placeholder="https://discord.gg/yourserver"
                      />
                    </LinkAccordion>

                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={handlePrevious}
                        className="flex-1 px-6 py-4 bg-surface-2 hover:bg-border text-text-primary font-bold rounded-xl transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting || slugAvailable === false}
                        className="flex-1 px-6 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Build'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Live Preview */}
              <div className="lg:sticky lg:top-24 h-fit">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-text-primary">Live Preview</h3>
                  <p className="text-sm text-text-muted">See how your project will look</p>
                </div>
                <CardPreview
                  name={formData.name}
                  description={formData.description}
                  avatar={formData.avatar}
                  tags={formData.tags}
                  category={formData.category}
                  type={mode}
                  needs={formData.needHelpWith}
                  links={{
                    site: formData.site,
                    github: formData.github,
                    threads: formData.threads,
                    twitter: formData.twitter,
                    linkedin: formData.linkedin,
                    dribbble: formData.dribbble,
                    behance: formData.behance,
                    instagram: formData.instagram,
                    indiehackers: formData.indiehackers,
                    producthunt: formData.producthunt,
                    reddit: formData.reddit,
                    youtube: formData.youtube,
                    blog: formData.blog,
                    discord: formData.discord,
                  }}
                />
              </div>
            </div>
          </form>
        </div>
      </div>

      <SubmitModal
        isOpen={showModal}
        onClose={handleModalClose}
        projectSlug={projectSlug}
        projectNumber={projectNumber}
      />
    </div>
  );
}

export default function NewProject() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-surface-0 flex items-center justify-center"><div className="text-text-primary">Loading...</div></div>}>
      <NewProjectForm />
    </Suspense>
  );
}
