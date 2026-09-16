import { CoabOrg, CourseProgram, Role, Specialization, UserProfile, CoabEvent, Deliverable } from '../types';

export const INITIAL_MEMBERS: UserProfile[] = [
  {
    id: 'lead-1',
    name: 'Justin Makabenta',
    email: 'makabentajustin55@gmail.com',
    org: 'COAB',
    position: 'Chief Media Director / Developer',
    courseProgram: 'BSA',
    contactNumber: '+63 917 123 4567',
    specializations: ['PHOTO', 'VIDEO', 'EDITING'],
    role: 'admin',
    emailVerified: true,
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const INITIAL_EVENTS: CoabEvent[] = [];

export const INITIAL_DELIVERABLES: Deliverable[] = [];

