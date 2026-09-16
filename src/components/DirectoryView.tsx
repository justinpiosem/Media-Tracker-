import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CoabOrg, CourseProgram, Role, Specialization, UserProfile } from '../types';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Mail, 
  Phone, 
  GraduationCap, 
  Briefcase, 
  Camera, 
  Video, 
  PenTool, 
  Share2, 
  Scissors, 
  Edit3, 
  Check, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const DirectoryView: React.FC = () => {
  const { 
    members, 
    userRole, 
    isSuperAdmin,
    updateMemberRole, 
    updateMemberSpecializations, 
    verifyMemberEmail, 
    updateCurrentProfile, 
    currentProfile, 
    currentUser,
    createMemberProfile,
    switchMember
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterOrg, setFilterOrg] = useState<string>('ALL');
  const [filterSpecialization, setFilterSpecialization] = useState<string>('ALL');

  // Edit My Profile Modal State
  const [isEditingProfileOpen, setIsEditingProfileOpen] = useState(false);
  // Add Member Modal State (Admin)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

  // Filtered members list
  const filteredMembers = members.filter((m) => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.courseProgram.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesOrg = filterOrg === 'ALL' || m.org === filterOrg;
    const matchesSpec = filterSpecialization === 'ALL' || m.specializations.includes(filterSpecialization as Specialization);

    return matchesSearch && matchesOrg && matchesSpec;
  });

  const specializationIcons: Record<Specialization, React.ReactNode> = {
    PHOTO: <Camera className="w-3 h-3" />,
    VIDEO: <Video className="w-3 h-3" />,
    GRAPHICS: <PenTool className="w-3 h-3" />,
    SOCIAL: <Share2 className="w-3 h-3" />,
    EDITING: <Scissors className="w-3 h-3" />,
  };

  const allSpecializations: Specialization[] = ['PHOTO', 'VIDEO', 'GRAPHICS', 'SOCIAL', 'EDITING'];

  const toggleSpecializationForMember = (member: UserProfile, spec: Specialization) => {
    if (userRole !== 'admin') {
      alert('Only Admin developers can configure member specializations.');
      return;
    }
    const current = member.specializations;
    const updated = current.includes(spec)
      ? current.filter((s) => s !== spec)
      : [...current, spec];
    updateMemberSpecializations(member.id, updated);
  };

  const handleRoleChange = (memberId: string, newRole: Role) => {
    if (userRole !== 'admin') {
      alert('Permissions can only be modified by Administrators.');
      return;
    }
    updateMemberRole(memberId, newRole);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header & Personal Profile Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#092638] dark:text-white flex flex-wrap items-center gap-2">
            <span>COAB Media Directory</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#064420]/10 text-[#064420] dark:text-[#4ade80] dark:bg-[#064420]/30 font-medium">
              Google Account Integrated
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete member registry across JPIA, JFMA, JHRMS, and YES. Profiles auto-populate the dashboard.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsEditingProfileOpen(true)}
            className="inline-flex items-center space-x-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0b2434] text-[#092638] dark:text-white text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all shadow-xs"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#064420] dark:text-[#4ade80]" />
            <span>Update My Profile</span>
          </button>

          {userRole === 'admin' && (
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="inline-flex items-center space-x-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#064420] text-white text-xs font-semibold hover:bg-[#245439] active:scale-95 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Current User Snapshot Card */}
      {currentProfile && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-white to-[#064420]/5 dark:from-[#0b2434] dark:to-[#064420]/20 border border-[#064420]/20 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3 sm:space-x-4">
            {currentProfile.photoUrl ? (
              <img
                src={currentProfile.photoUrl}
                alt={currentProfile.name}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border-2 border-white dark:border-[#0b2434] shadow-sm shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#064420] text-white flex items-center justify-center text-lg font-bold shrink-0">
                {currentProfile.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <h3 className="text-sm sm:text-base font-bold text-[#092638] dark:text-white truncate">
                  {currentProfile.name}
                </h3>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#E1910F]/15 text-[#E1910F] border border-[#E1910F]/30">
                  {currentProfile.role}
                </span>
                {currentProfile.emailVerified ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
                    Unverified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {currentProfile.position} • {currentProfile.org} ({currentProfile.courseProgram})
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {currentProfile.specializations.map((spec) => (
                  <span
                    key={spec}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-[#061722] text-[#064420] dark:text-[#4ade80] border border-slate-200 dark:border-slate-800"
                  >
                    {specializationIcons[spec]}
                    <span>{spec}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:items-end text-xs text-slate-500 space-y-1 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
            <span className="flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{currentProfile.email}</span>
            </span>
            {currentProfile.contactNumber && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <span>{currentProfile.contactNumber}</span>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white dark:bg-[#0b2434] p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, organization, position, or program..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#061722] border-none text-[#092638] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#064420]"
          />
        </div>

        {/* Filter by Organization and Specialization */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <select
            value={filterOrg}
            onChange={(e) => setFilterOrg(e.target.value)}
            className="flex-1 sm:flex-none text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#061722] text-[#092638] dark:text-white focus:outline-none"
          >
            <option value="ALL">All Orgs</option>
            <option value="JPIA">JPIA</option>
            <option value="JFMA">JFMA</option>
            <option value="JHRMS">JHRMS</option>
            <option value="YES">YES</option>
            <option value="COAB">COAB</option>
          </select>

          {/* Filter by Specialization */}
          <select
            value={filterSpecialization}
            onChange={(e) => setFilterSpecialization(e.target.value)}
            className="flex-1 sm:flex-none text-xs font-semibold py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#061722] text-[#092638] dark:text-white focus:outline-none"
          >
            <option value="ALL">All Specializations</option>
            <option value="PHOTO">PHOTO</option>
            <option value="VIDEO">VIDEO</option>
            <option value="GRAPHICS">GRAPHICS</option>
            <option value="SOCIAL">SOCIAL</option>
            <option value="EDITING">EDITING</option>
          </select>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white dark:bg-[#0b2434] rounded-3xl border border-slate-200/80 dark:border-slate-700/80 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
          >
            {/* Top Card Info */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {member.photoUrl ? (
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-2xl bg-[#064420] text-white flex items-center justify-center font-bold text-sm">
                      {member.name.charAt(0)}
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-sm text-[#092638] dark:text-white">
                      {member.name}
                    </h4>
                    <span className="text-[11px] text-[#064420] dark:text-[#4ade80] font-semibold block">
                      {member.position}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {member.org}
                  </span>
                  {currentProfile?.id === member.id ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      Active
                    </span>
                  ) : (
                    <button
                      onClick={() => switchMember(member.id)}
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                    >
                      View As
                    </button>
                  )}
                </div>
              </div>

              {/* Course & Contact Details */}
              <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{member.courseProgram}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
                {member.contactNumber && (
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{member.contactNumber}</span>
                  </div>
                )}
              </div>

              {/* Email Verification Status */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Email Verification:</span>
                {member.emailVerified ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified
                  </span>
                ) : (
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-medium text-amber-600">Pending</span>
                    {userRole === 'admin' && (
                      <button
                        onClick={() => verifyMemberEmail(member.id)}
                        className="text-[10px] font-bold text-blue-600 hover:underline"
                      >
                        Verify Now
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Specializations Tags (Admin can toggle directly) */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                  Specializations {userRole === 'admin' && '(Click to toggle)'}:
                </span>
                <div className="flex flex-wrap gap-1">
                  {allSpecializations.map((spec) => {
                    const isActive = member.specializations.includes(spec);
                    return (
                      <button
                        key={spec}
                        onClick={() => toggleSpecializationForMember(member, spec)}
                        disabled={userRole !== 'admin'}
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all ${
                          isActive
                            ? 'bg-[#064420]/15 text-[#064420] dark:text-[#6ee7b7] border border-[#064420]/30 font-bold'
                            : 'bg-slate-100 dark:bg-slate-800/60 text-slate-400 border border-transparent hover:border-slate-300'
                        }`}
                      >
                        {specializationIcons[spec]}
                        <span>{spec}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Role Assignment (Permissions assigned only by Developer Admin) */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">System Role:</span>
              {isSuperAdmin ? (
                <select
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.id, e.target.value as Role)}
                  className="text-[11px] font-bold py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white capitalize focus:outline-none"
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="contributor">Contributor</option>
                </select>
              ) : (
                <span className="text-[11px] font-bold capitalize text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  {member.role}
                  {member.role === 'admin' && <ShieldCheck className="w-3 h-3 text-[#E1910F]" />}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: Update My Profile */}
      {isEditingProfileOpen && currentProfile && (
        <EditProfileModal
          profile={currentProfile}
          onClose={() => setIsEditingProfileOpen(false)}
          onSave={(data) => {
            updateCurrentProfile(data);
            setIsEditingProfileOpen(false);
          }}
        />
      )}

      {/* MODAL: Add New Member (Admin) */}
      {isAddMemberOpen && (
        <AddMemberModal
          onClose={() => setIsAddMemberOpen(false)}
          onSubmit={(data) => {
            createMemberProfile(data);
            setIsAddMemberOpen(false);
          }}
        />
      )}
    </div>
  );
};

// Sub-modal: Edit Profile
const EditProfileModal: React.FC<{
  profile: UserProfile;
  onClose: () => void;
  onSave: (data: Partial<UserProfile>) => void;
}> = ({ profile, onClose, onSave }) => {
  const [name, setName] = useState(profile.name);
  const [org, setOrg] = useState<CoabOrg>(profile.org);
  const [position, setPosition] = useState(profile.position);
  const [courseProgram, setCourseProgram] = useState<CourseProgram>(profile.courseProgram);
  const [contactNumber, setContactNumber] = useState(profile.contactNumber);
  const [photoUrl, setPhotoUrl] = useState(profile.photoUrl || '');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setPhotoUrl(uploadEvent.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      org,
      position,
      courseProgram,
      contactNumber,
      photoUrl,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#0b2434] border border-slate-200 dark:border-slate-700 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-[#092638] dark:text-white">Update COAB Profile</h3>
        
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          
          {/* Profile Picture Upload & Preview */}
          <div className="flex items-center space-x-4">
            {photoUrl ? (
              <img src={photoUrl} alt="Preview" className="w-16 h-16 rounded-2xl object-cover border border-slate-200" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#064420] text-white flex items-center justify-center font-bold text-lg">
                {name.charAt(0) || 'U'}
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Profile Photo (Upload or URL)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#064420] file:text-white hover:file:bg-[#245439]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">COAB Organization</label>
              <select
                value={org}
                onChange={(e) => setOrg(e.target.value as CoabOrg)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
              >
                <option value="JPIA">JPIA</option>
                <option value="JFMA">JFMA</option>
                <option value="JHRMS">JHRMS</option>
                <option value="YES">YES</option>
                <option value="COAB">COAB (Central)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Course & Major</label>
              <select
                value={courseProgram}
                onChange={(e) => setCourseProgram(e.target.value as CourseProgram)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
              >
                <option value="BSA">BSA (Accountancy)</option>
                <option value="BSAIS">BSAIS (Accounting Info Systems)</option>
                <option value="BSBA-FM">BSBA-FM (Financial Mgmt)</option>
                <option value="BSBA-HRM">BSBA-HRM (Human Resource)</option>
                <option value="BS-ENTREP">BS-ENTREP (Entrepreneurship)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Designation / Position</label>
              <input
                type="text"
                required
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="e.g. Lead Videographer"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Number</label>
              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+63 9XX XXX XXXX"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#064420] text-white hover:bg-[#245439] font-semibold"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Sub-modal: Add Member Modal
const AddMemberModal: React.FC<{
  onClose: () => void;
  onSubmit: (data: any) => void;
}> = ({ onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [org, setOrg] = useState<CoabOrg>('JPIA');
  const [position, setPosition] = useState('Multimedia Committee Member');
  const [courseProgram, setCourseProgram] = useState<CourseProgram>('BSA');
  const [contactNumber, setContactNumber] = useState('');
  const [role, setRole] = useState<Role>('contributor');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      email,
      org,
      position,
      courseProgram,
      contactNumber,
      role,
      specializations: ['PHOTO', 'EDITING'],
      emailVerified: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#0b2434] border border-slate-200 dark:border-slate-700 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-[#092638] dark:text-white">Add New Media Committee Member</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Organization</label>
              <select
                value={org}
                onChange={(e) => setOrg(e.target.value as CoabOrg)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
              >
                <option value="JPIA">JPIA</option>
                <option value="JFMA">JFMA</option>
                <option value="JHRMS">JHRMS</option>
                <option value="YES">YES</option>
                <option value="COAB">COAB</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Program</label>
              <select
                value={courseProgram}
                onChange={(e) => setCourseProgram(e.target.value as CourseProgram)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
              >
                <option value="BSA">BSA</option>
                <option value="BSAIS">BSAIS</option>
                <option value="BSBA-FM">BSBA-FM</option>
                <option value="BSBA-HRM">BSBA-HRM</option>
                <option value="BS-ENTREP">BS-ENTREP</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Position</label>
              <input
                type="text"
                required
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Access Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#061722] text-[#092638] dark:text-white font-medium"
              >
                <option value="contributor">Contributor</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#064420] text-white hover:bg-[#245439] font-semibold"
            >
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
