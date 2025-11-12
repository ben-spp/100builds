'use client';

import { useState, Suspense } from 'react';
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
import { ProjectType } from '@/types/project';

function NewProjectForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = (searchParams.get('mode') || 'show') as ProjectType;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    avatar: '',
    tags: [] as string[],
    category: '',
    site: '',
    github: '',
    twitter: '',
    needHelpWith: '',
  });

  const [showModal, setShowModal] = useState(false);
  const [projectSlug, setProjectSlug] = useState('');
  const [projectNumber, setProjectNumber] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['app', 'web app', 'concept'];
  const helpOptions = ['design', 'development', 'marketing', 'funding', 'other'];

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

    const step2Fields = [
      formData.site,
      formData.github,
      formData.twitter,
    ];

    const step1Completed = step1Fields.filter(f => f).length;
    const step2Completed = step2Fields.filter(f => f).length;

    return [step1Completed, step2Completed];
  };

  const stepFieldCounts = mode === 'help' ? [6, 3] : [5, 3];
  const completedFields = getCompletedFields();

  const slugify = (text: string): string => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

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
    const slug = slugify(formData.name);

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('slug', slug);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: uploadFormData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    setFormData({ ...formData, avatar: data.url });
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
      tags: formData.tags.length > 0 ? formData.tags : undefined,
      category: formData.category,
      needs: mode === 'help' ? formData.needHelpWith : undefined,
      links: {
        site: formData.site || undefined,
        github: formData.github || undefined,
        twitter: formData.twitter || undefined,
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
        const data = await response.json();
        setProjectSlug(slug);
        setProjectNumber(data.projectNumber);
        setShowModal(true);
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
      {/* Non-sticky Header */}
      <header className="relative top-0 left-0 right-0 z-40 bg-surface-0/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-text-primary hover:text-primary transition-colors">
            100builds
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
                ? 'Create a beautiful page to showcase what you\'re building'
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

      {/* Form Progress - Full Width Static on desktop */}
      <div className="hidden lg:block mb-12">
        <FormProgress
          currentStep={currentStep}
          totalSteps={2}
          stepFieldCounts={stepFieldCounts}
          completedFields={completedFields}
        />
      </div>

      {/* Form Section */}
      <div className="pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Form */}
              <div className="space-y-6">
                {/* Step 1: Project Details */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <FormField
                      label="Project Name"
                      name="name"
                      value={formData.name}
                      onChange={(value) => setFormData({ ...formData, name: value })}
                      placeholder="Enter the name of your build"
                      required
                    />

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
                      disabled={!canProceedToStep2}
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

                    <FormField
                      label="Website"
                      name="site"
                      type="url"
                      value={formData.site}
                      onChange={(value) => setFormData({ ...formData, site: value })}
                      placeholder="https://100builds.app"
                    />

                    <FormField
                      label="GitHub"
                      name="github"
                      type="url"
                      value={formData.github}
                      onChange={(value) => setFormData({ ...formData, github: value })}
                      placeholder="https://github.com/username/repo"
                    />

                    <FormField
                      label="Twitter"
                      name="twitter"
                      type="url"
                      value={formData.twitter}
                      onChange={(value) => setFormData({ ...formData, twitter: value })}
                      placeholder="https://twitter.com/username"
                    />

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
                        disabled={isSubmitting}
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
