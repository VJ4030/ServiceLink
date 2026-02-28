
import { ServiceCategory } from '../types';

// Mock implementation to replace Google GenAI SDK for frontend-only deployment
// This removes the build dependency on @google/genai

export interface Recommendation {
  category: ServiceCategory;
  reasoning: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const getSmartRecommendation = async (userProblem: string): Promise<Recommendation | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const lowerInput = userProblem.toLowerCase();
  let category = ServiceCategory.ELECTRICIAN;
  let reasoning = "Based on your description, this appears to be an electrical maintenance issue.";
  let urgency: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM';

  // Simple keyword matching for mock logic
  if (lowerInput.includes('leak') || lowerInput.includes('water') || lowerInput.includes('pipe') || lowerInput.includes('tap') || lowerInput.includes('sink')) {
    category = ServiceCategory.PLUMBER;
    reasoning = "Water leakage or drainage issues require a professional plumber immediately to prevent damage.";
    urgency = 'HIGH';
  } else if (lowerInput.includes('clean') || lowerInput.includes('dust') || lowerInput.includes('dirty') || lowerInput.includes('wash')) {
    category = ServiceCategory.CLEANING;
    reasoning = "For general cleanliness and hygiene, a professional cleaning service is recommended.";
    urgency = 'LOW';
  } else if (lowerInput.includes('ac') || lowerInput.includes('cool') || lowerInput.includes('heat') || lowerInput.includes('air')) {
    category = ServiceCategory.HVAC;
    reasoning = "Issues with air conditioning or heating systems require an HVAC specialist.";
    urgency = 'HIGH';
  } else if (lowerInput.includes('wood') || lowerInput.includes('door') || lowerInput.includes('furniture') || lowerInput.includes('lock')) {
    category = ServiceCategory.CARPENTER;
    reasoning = "Furniture and structural wood repairs are best handled by a skilled carpenter.";
    urgency = 'MEDIUM';
  } else if (lowerInput.includes('paint') || lowerInput.includes('wall') || lowerInput.includes('color')) {
    category = ServiceCategory.PAINTER;
    reasoning = "Wall finishing and painting tasks should be done by a professional painter.";
    urgency = 'LOW';
  } else if (lowerInput.includes('move') || lowerInput.includes('shift') || lowerInput.includes('pack')) {
    category = ServiceCategory.MOVING;
    reasoning = "Relocating items or houses requires professional movers.";
    urgency = 'MEDIUM';
  } else if (lowerInput.includes('pest') || lowerInput.includes('bug') || lowerInput.includes('insect')) {
    category = ServiceCategory.PEST_CONTROL;
    reasoning = "Pest infestations should be treated by certified pest control experts.";
    urgency = 'HIGH';
  }

  return {
    category,
    reasoning,
    urgency
  };
};
