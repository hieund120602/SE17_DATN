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

  // Additional personal info
  identityCardNumber: string;
  homeAddress: string;

  // Tutor profile info
  teachingRequirements: string;

  // Education information
  educations: Education[];

  // Work experience
  experiences: Experience[];

  // Certificates
  certificateUrls: string[];

  // Action methods
  setBasicInfo: (data: {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
  }) => void;

  setPersonalInfo: (data: {
    identityCardNumber: string;
    homeAddress: string;
  }) => void;

  setTeachingRequirements: (requirements: string) => void;

  addEducation: (education: Education) => void;
  updateEducation: (index: number, education: Education) => void;
  removeEducation: (index: number) => void;

  addExperience: (experience: Experience) => void;
  updateExperience: (index: number, experience: Experience) => void;
  removeExperience: (index: number) => void;

  addCertificateUrl: (url: string) => void;
  removeCertificateUrl: (index: number) => void;

  reset: () => void;
}

const initialState = {
  fullName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
  identityCardNumber: '',
  homeAddress: '',
  teachingRequirements: '',
  educations: [] as Education[],
  experiences: [] as Experience[],
  certificateUrls: [] as string[],
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

      setPersonalInfo: (data) => set({
        identityCardNumber: data.identityCardNumber,
        homeAddress: data.homeAddress
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

      addCertificateUrl: (url) => set((state) => ({
        certificateUrls: [...state.certificateUrls, url]
      })),

      removeCertificateUrl: (index) => set((state) => ({
        certificateUrls: state.certificateUrls.filter((_, i) => i !== index)
      })),

      reset: () => set(initialState)
    }),
    {
      name: 'tutor-registration-storage'
    }
  )
);