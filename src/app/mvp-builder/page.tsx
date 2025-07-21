'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wrench, Target, Users, Zap, ArrowRight, CheckCircle, Plus, X, List, MapPin, ArrowDown, FileText, Presentation } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface Feature {
  id: number;
  name: string;
  priority: string;
}

interface JourneyFeature {
  id: number;
  name: string;
}

interface UserJourneyStep {
  id: number;
  step: string;
  features: JourneyFeature[];
  isDefault?: boolean;
}

export default function MVPBuilder() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    problemStatement: '',
    targetCustomer: '',
    solution: '',
    industry: ''
  });
  const [features, setFeatures] = useState<Feature[]>([]);
  const [draggedFeature, setDraggedFeature] = useState<Feature | null>(null);
  const [newFeature, setNewFeature] = useState('');
  const [userJourney, setUserJourney] = useState<UserJourneyStep[]>([
    { id: 1, step: 'User discovers your product', features: [], isDefault: true },
    { id: 2, step: 'User signs up or gets started', features: [], isDefault: true },
    { id: 3, step: 'User achieves their main goal', features: [], isDefault: true }
  ]);
  const [newJourneyStep, setNewJourneyStep] = useState('');
  const [includePitchDeck, setIncludePitchDeck] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const buildReport = async () => {
    console.log('Building...')
    setIsGenerating(true);
    setError(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error('You must be logged in to use this feature')
      }

      const mvpData = {
        problemStatement: formData.problemStatement,
        targetCustomer: formData.targetCustomer,
        solution: formData.solution,
        industry: formData.industry,
        features: features,
        userJourney: userJourney,
        includePitchDeck: includePitchDeck
      };

      const { data, error: insertError } = await supabase
        .from('mvps')
        .insert([
          {
            user: user.id,
            data: mvpData
          }
        ])
        .select();

      if (insertError) {
        throw insertError;
      }
      console.log('MVP saved: ', data);
      const mvpId = data[0].id;

      console.log('mvpId:', mvpId);
      console.log('mvpId type:', typeof mvpId);
      console.log('Attempting to navigate to:', `/report/${mvpId}`);

      router.push(`/report/${mvpId}`);

    } catch (err: unknown) {
      console.error('Error saving MVP: ', err);
      setError(err instanceof Error ? err.message : 'Failed to save MVP. Please try again');
      console.log(error)
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepComplete = (step: number) => {
    switch (step) {
      case 1: return formData.problemStatement.trim().length > 20;
      case 2: return formData.targetCustomer.trim().length > 20;
      case 3: return formData.solution.trim().length > 20;
      case 4: return formData.industry.length > 0;
      case 5: return features.some(f => f.priority === 'must-have');
      case 6: return userJourney.every(step => step.features.length > 0);
      default: return false;
    }
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFeatures([...features, {
        id: Date.now(),
        name: newFeature.trim(),
        priority: 'unassigned'
      }]);
      setNewFeature('');
    }
  };

  const handleDragStart = (e: React.DragEvent, feature: Feature) => {
    setDraggedFeature(feature);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, priority: string) => {
    e.preventDefault();
    if (draggedFeature) {
      setFeatures(features.map(f => 
        f.id === draggedFeature.id 
          ? { ...f, priority } 
          : f
      ));
      setDraggedFeature(null);
    }
  };

  const removeFeature = (featureId: number) => {
    setFeatures(features.filter(f => f.id !== featureId));
  };

  const addJourneyStep = () => {
    if (newJourneyStep.trim()) {
      setUserJourney([...userJourney, {
        id: Date.now(),
        step: newJourneyStep.trim(),
        features: [],
        isDefault: false
      }]);
      setNewJourneyStep('');
    }
  };

  const removeJourneyStep = (stepId: number) => {
    setUserJourney(userJourney.filter(step => step.id !== stepId));
  };

  const addFeatureToJourneyStep = (stepId: number, featureName: string) => {
    setUserJourney(userJourney.map(step => 
      step.id === stepId 
        ? { ...step, features: [...step.features, { id: Date.now(), name: featureName }] }
        : step
    ));
  };

  const removeFeatureFromJourneyStep = (stepId: number, featureId: number) => {
    setUserJourney(userJourney.map(step => 
      step.id === stepId 
        ? { ...step, features: step.features.filter(f => f.id !== featureId) }
        : step
    ));
  };

  const canProceed = isStepComplete(currentStep);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#121212] text-gray-800 dark:text-white">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
              <Wrench size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold">MVP Builder</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Transform your startup idea into a focused, buildable MVP. We&apos;ll help you identify core features, prioritize development, and create a roadmap for success.
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Step {currentStep} of 7
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round((currentStep / 7) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-blue-700 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / 7) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Steps Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 sticky top-6">
              <h3 className="font-semibold text-lg mb-4">Build Process</h3>
              <div className="space-y-4">
                {[
                  { num: 1, title: 'Define Problem', icon: Target, desc: 'What problem are you solving?' },
                  { num: 2, title: 'Target Customer', icon: Users, desc: 'Who experiences this problem?' },
                  { num: 3, title: 'Your Solution', icon: Zap, desc: 'How will you solve it?' },
                  { num: 4, title: 'Industry Context', icon: CheckCircle, desc: 'What industry/market?' },
                  { num: 5, title: 'Feature Priority', icon: List, desc: 'Prioritize your features' },
                  { num: 6, title: 'User Journey', icon: MapPin, desc: 'Map user actions & needs' },
                  { num: 7, title: 'Final Steps', icon: FileText, desc: 'Pitch deck & report options' }
                ].map((step) => (
                  <div 
                    key={step.num}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                      currentStep === step.num 
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600' 
                        : currentStep > step.num 
                          ? 'bg-green-50 dark:bg-green-900/20' 
                          : 'opacity-60'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      currentStep === step.num 
                        ? 'bg-blue-600 text-white' 
                        : currentStep > step.num 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      <step.icon size={16} />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{step.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">What problem are you solving?</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Describe the core problem your startup addresses. Be specific about the pain point people experience.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Problem Statement</label>
                    <textarea
                      value={formData.problemStatement}
                      onChange={(e) => handleInputChange('problemStatement', e.target.value)}
                      placeholder="e.g., Small business owners struggle to track their inventory across multiple sales channels, leading to overselling and stockouts..."
                      className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formData.problemStatement.length}/500 characters (minimum 20 required)
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Who is your target customer?</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Define your ideal customer. Be specific about demographics, behaviors, and characteristics.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Target Customer</label>
                    <textarea
                      value={formData.targetCustomer}
                      onChange={(e) => handleInputChange('targetCustomer', e.target.value)}
                      placeholder="e.g., Small to medium retail business owners (10-100 employees) who sell both online and in physical stores, typically aged 30-50, tech-comfortable but not developers..."
                      className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formData.targetCustomer.length}/500 characters (minimum 20 required)
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">What&apos;s your solution?</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Describe how your product solves the problem. Focus on the core value proposition.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Solution Description</label>
                    <textarea
                      value={formData.solution}
                      onChange={(e) => handleInputChange('solution', e.target.value)}
                      placeholder="e.g., A unified inventory management platform that automatically syncs stock levels across all sales channels in real-time, with smart alerts and analytics..."
                      className="w-full h-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formData.solution.length}/500 characters (minimum 20 required)
                    </p>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">What industry/market?</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Select the primary industry or market your solution serves.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Industry</label>
                    <select
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Select an industry...</option>
                      <option value="ecommerce">E-commerce & Retail</option>
                      <option value="saas">Software as a Service (SaaS)</option>
                      <option value="fintech">Financial Technology</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="education">Education</option>
                      <option value="real-estate">Real Estate</option>
                      <option value="food-delivery">Food & Delivery</option>
                      <option value="travel">Travel & Hospitality</option>
                      <option value="fitness">Fitness & Wellness</option>
                      <option value="productivity">Productivity Tools</option>
                      <option value="social">Social Media & Communication</option>
                      <option value="gaming">Gaming & Entertainment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Prioritize Your Features</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Add features and drag them into the appropriate priority columns. Focus on what&apos;s essential for your MVP.
                    </p>
                  </div>
                  
                  {/* Add Feature Input */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder="Add a feature (e.g., User authentication, Product search, Shopping cart...)"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                        onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                      />
                      <button
                        onClick={addFeature}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2 font-medium transition-colors"
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Feature Priority Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { key: 'unassigned', title: 'Features to Sort', color: 'gray' },
                      { key: 'must-have', title: 'Must Have', color: 'red' },
                      { key: 'should-have', title: 'Should Have', color: 'yellow' },
                      { key: 'could-have', title: 'Could Have', color: 'green' },
                      { key: 'future', title: 'Future/Post-MVP', color: 'blue' }
                    ].slice(0, 4).map((column) => (
                      <div
                        key={column.key}
                        className={`min-h-[300px] p-4 rounded-lg border-2 border-dashed transition-colors ${
                          column.color === 'gray' ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700' :
                          column.color === 'red' ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20' :
                          column.color === 'yellow' ? 'border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' :
                          column.color === 'green' ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20' :
                          'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                        }`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, column.key)}
                      >
                        <h3 className="font-semibold text-sm mb-3 text-center">{column.title}</h3>
                        <div className="space-y-2">
                          {features.filter(f => f.priority === column.key).map((feature) => (
                            <div
                              key={feature.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, feature)}
                              className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 cursor-move hover:shadow-md transition-shadow group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{feature.name}</span>
                                <button
                                  onClick={() => removeFeature(feature.id)}
                                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Second Row for Future Features */}
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div
                      className="min-h-[150px] p-4 rounded-lg border-2 border-dashed border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20 transition-colors"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, 'future')}
                    >
                      <h3 className="font-semibold text-sm mb-3 text-center">Future/Post-MVP</h3>
                      <div className="space-y-2">
                        {features.filter(f => f.priority === 'future').map((feature) => (
                          <div
                            key={feature.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, feature)}
                            className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-600 cursor-move hover:shadow-md transition-shadow group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{feature.name}</span>
                              <button
                                onClick={() => removeFeature(feature.id)}
                                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {features.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      Start by adding some features above, then drag them into priority columns.
                    </div>
                  )}
                </div>
              )}

              {currentStep === 6 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Map Your User Journey</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Think about the path your users take from discovering your product to achieving their goal. For each step, identify what features they need.
                    </p>
                  </div>

                  {/* Add Journey Step */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <p>This adds a user journey step to the end of the below steps.</p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newJourneyStep}
                        onChange={(e) => setNewJourneyStep(e.target.value)}
                        placeholder="Add a step in your user's journey (e.g., User browses products, User makes a purchase...)"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                        onKeyPress={(e) => e.key === 'Enter' && addJourneyStep()}
                      />
                      <button
                        onClick={addJourneyStep}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2 font-medium transition-colors"
                      >
                        <Plus size={16} />
                        Add Step
                      </button>
                    </div>
                  </div>

                  {/* User Journey Steps */}
                  <div className="space-y-4">
                    {userJourney.map((step, index) => (
                      <div key={step.id} className="relative">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                {index + 1}
                              </div>
                              <h3 className="font-semibold text-lg">{step.step}</h3>
                            </div>
                            {!step.isDefault && (
                              <button
                                onClick={() => removeJourneyStep(step.id)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>

                          <div className="mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              What features does your user need at this step?
                            </p>
                            
                            {/* Feature Input for this step */}
                            <div className="flex gap-2 mb-3">
                              <input
                                type="text"
                                placeholder="Type a feature needed here..."
                                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                onKeyPress={(e) => {
                                  const target = e.target as HTMLInputElement;
                                  if (e.key === 'Enter' && target.value.trim()) {
                                    addFeatureToJourneyStep(step.id, target.value.trim());
                                    target.value = '';
                                  }
                                }}
                              />
                              <button
                                onClick={(e) => {
                                  const button = e.target as HTMLButtonElement;
                                  const input = button.parentElement?.querySelector('input') as HTMLInputElement;
                                  if (input?.value.trim()) {
                                    addFeatureToJourneyStep(step.id, input.value.trim());
                                    input.value = '';
                                  }
                                }}
                                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm transition-colors"
                              >
                                Add
                              </button>
                            </div>

                            {/* Features for this step */}
                            <div className="flex flex-wrap gap-2">
                              {step.features.map((feature) => (
                                <div
                                  key={feature.id}
                                  className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                                >
                                  <span>{feature.name}</span>
                                  <button
                                    onClick={() => removeFeatureFromJourneyStep(step.id, feature.id)}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-100"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>

                            {step.features.length === 0 && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                No features added yet. What does your user need to accomplish this step?
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Arrow between steps */}
                        {index < userJourney.length - 1 && (
                          <div className="flex justify-center py-2">
                            <ArrowDown className="text-gray-400 dark:text-gray-500" size={20} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Helper Text */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">💡 Tips for mapping your user journey:</h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Think like your customer - what&apos;s their first impression?</li>
                      <li>• Focus on the main path to success, not every possible action</li>
                      <li>• Each step should move them closer to their goal</li>
                      <li>• Consider what might stop them at each step</li>
                    </ul>
                  </div>
                </div>

                
              )}

              {currentStep === 7 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">Finalize Your MVP Plan</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Choose additional options for your comprehensive MVP report.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <input
                        type="checkbox"
                        id="pitchDeck"
                        checked={includePitchDeck}
                        onChange={(e) => setIncludePitchDeck(e.target.checked)}
                        className="mt-1 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label htmlFor="pitchDeck" className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Presentation size={20} className="text-purple-600 dark:text-purple-400" />
                          <span className="font-semibold">Include Pitch Deck Builder</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Generate a professional pitch deck alongside your MVP plan using the information you&apos;ve provided. 
                          This will include slides for problem statement, solution, target market, features, and roadmap.
                        </p>
                      </label>
                    </div>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">📋 Your MVP Plan Will Include:</h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Executive Summary & Problem Analysis</li>
                      <li>• Target Customer Profile</li>
                      <li>• Feature Prioritization Matrix</li>
                      <li>• User Journey Mapping</li>
                      <li>• Development Roadmap</li>
                      <li>• Success Metrics & Next Steps</li>
                      {includePitchDeck && <li>• Professional Pitch Deck (10-12 slides)</li>}
                    </ul>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Back
                </button>
                
                <div className="flex items-center gap-4">
                  {!canProceed && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Complete this step to continue
                    </span>
                  )}
                  <button
                    onClick={currentStep === 7 ? buildReport : handleNext}
                    disabled={isGenerating}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-800 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    {isGenerating ? (
                      <>
                        <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white'></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        {currentStep === 7 ? 'Build MVP Plan' : 'Next Step'}
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}