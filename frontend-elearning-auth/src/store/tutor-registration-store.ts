import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  current: boolean;
}

interface TutorRegistrationState {
  // Basic account details
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;

  // Tutor profile info
  teachingRequirements: string;

  // Education information
  educations: Education[];

  // Work experience
  experiences: Experience[];

  // Action methods
  setBasicInfo: (data: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
  }) => void;

  setTeachingRequirements: (requirements: string) => void;

  addEducation: (education: Education) => void;
  updateEducation: (index: number, education: Education) => void;
  removeEducation: (index: number) => void;

  addExperience: (experience: Experience) => void;
  updateExperience: (index: number, experience: Experience) => void;
  removeExperience: (index: number) => void;

  reset: () => void;
}

const initialState = {
  fullName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
  teachingRequirements: '',
  educations: [],
  experiences: []
};

export const useTutorRegistrationStore = create<TutorRegistrationState>()(
  persist(
    (set) => ({
      ...initialState,

      setBasicInfo: (data) => set({
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
        confirmPassword: data.confirmPassword
      }),

      setTeachingRequirements: (requirements) => set({
        teachingRequirements: requirements
      }),

      addEducation: (education) => set((state) => ({
        educations: [...state.educations, education]
      })),

      updateEducation: (index, education) => set((state) => {
        const updatedEducations = [...state.educations];
        updatedEducations[index] = education;
        return { educations: updatedEducations };
      }),

      removeEducation: (index) => set((state) => ({
        educations: state.educations.filter((_, i) => i !== index)
      })),

      addExperience: (experience) => set((state) => ({
        experiences: [...state.experiences, experience]
      })),

      updateExperience: (index, experience) => set((state) => {
        const updatedExperiences = [...state.experiences];
        updatedExperiences[index] = experience;
        return { experiences: updatedExperiences };
      }),

      removeExperience: (index) => set((state) => ({
        experiences: state.experiences.filter((_, i) => i !== index)
      })),

      reset: () => set(initialState)
    }),
    {
      name: 'tutor-registration-storage'
    }
  )
);