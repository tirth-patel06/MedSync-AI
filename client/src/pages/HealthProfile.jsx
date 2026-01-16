import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Heart,
  Activity,
  Shield,
  Calendar,
  Phone,
  Edit3,
  Save,
  X,
  ArrowLeft,
  Stethoscope,
  Users,
  Pill,
  AlertTriangle,
  Plus,
  BarChart3,
} from "lucide-react";

function HealthProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({});

  const token = localStorage.getItem("token");

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/health", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.profile) {
        setProfile(data.profile);
        setForm({
          ...data.profile,
          emergencyContactName: data.profile.emergencyContact?.name || "",
          emergencyContactPhone: data.profile.emergencyContact?.phone || "",
        });
      } else {
        setProfile(null);
        setForm({});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle emergency contact fields separately
    if (name === "emergencyContactName") {
      setForm({
        ...form,
        emergencyContactName: value,
        emergencyContact: {
          ...form.emergencyContact,
          name: value,
        },
      });
    } else if (name === "emergencyContactPhone") {
      setForm({
        ...form,
        emergencyContactPhone: value,
        emergencyContact: {
          ...form.emergencyContact,
          phone: value,
        },
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Helper function to clean array fields
    const cleanArrayField = (field) => {
      if (!field) return [];
      if (Array.isArray(field)) {
        return field.map(item => item.trim()).filter(item => item.length > 0);
      }
      return [];
    };

    // Build clean payload with only defined fields
    const payload = {};
    
    // Add basic fields if they exist
    if (form.age) payload.age = Number(form.age);
    if (form.gender) payload.gender = form.gender.trim();
    if (form.height) payload.height = Number(form.height);
    if (form.weight) payload.weight = Number(form.weight);
    if (form.bloodGroup) payload.bloodGroup = form.bloodGroup.trim();
    if (form.lastCheckup) payload.lastCheckup = form.lastCheckup;
    
    // Clean and add array fields
    const medicalConditions = cleanArrayField(form.medicalConditions);
    if (medicalConditions.length > 0) {
      payload.medicalConditions = medicalConditions;
    }
    
    const allergies = cleanArrayField(form.allergies);
    if (allergies.length > 0) {
      payload.allergies = allergies;
    }
    
    const medications = cleanArrayField(form.medications);
    if (medications.length > 0) {
      payload.medications = medications;
    }
    
    // Add emergency contact if both name and phone are provided
    const emergencyName = form.emergencyContactName?.trim();
    const emergencyPhone = form.emergencyContactPhone?.trim();
    
    if (emergencyName || emergencyPhone) {
      payload.emergencyContact = {
        name: emergencyName || "",
        phone: emergencyPhone || "",
      };
    }

    try {
      const res = await fetch("http://localhost:8080/api/health", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        setForm({
          ...data.profile,
          emergencyContactName: data.profile.emergencyContact?.name || "",
          emergencyContactPhone: data.profile.emergencyContact?.phone || "",
        });
        setEditMode(false);
      }
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile. Please try again.");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your health profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-3 hover:bg-slate-800/50 rounded-xl transition-all group"
            >
              <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
                Health Profile
              </h1>
              <p className="text-slate-400">Manage your health information</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!editMode && profile && (
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 rounded-xl font-medium transition-all shadow-lg"
              >
                <Edit3 className="w-5 h-5" />
                <span>Edit Profile</span>
              </button>
            )}

            <button
              onClick={() => navigate("/analytics")}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 rounded-xl font-medium transition-all shadow-lg"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Analytics</span>
            </button>
          </div>
        </header>

        {!editMode ? (
          profile ? (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Profile Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Info Card */}
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-rose-500/20 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Basic Information</h2>
                      <p className="text-slate-400 text-sm">
                        Your personal details
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoCard
                      icon={Calendar}
                      label="Age"
                      value={`${profile.age} years`}
                    />
                    <InfoCard
                      icon={User}
                      label="Gender"
                      value={profile.gender}
                    />
                    <InfoCard
                      icon={Activity}
                      label="Height"
                      value={`${profile.height} cm`}
                    />
                    <InfoCard
                      icon={Activity}
                      label="Weight"
                      value={`${profile.weight} kg`}
                    />
                    <InfoCard
                      icon={Heart}
                      label="Blood Group"
                      value={profile.bloodGroup}
                    />
                    <InfoCard
                      icon={Stethoscope}
                      label="Last Checkup"
                      value={
                        profile.lastCheckup
                          ? new Date(profile.lastCheckup).toLocaleDateString()
                          : "Not recorded"
                      }
                    />
                  </div>
                </div>

                {/* Medical History Card */}
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-xl flex items-center justify-center">
                      <Stethoscope className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Medical History</h2>
                      <p className="text-slate-400 text-sm">
                        Conditions, allergies & medications
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-800/50 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <span className="font-medium">Medical Conditions</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {profile.medicalConditions &&
                        profile.medicalConditions.length > 0 ? (
                          profile.medicalConditions.map((condition, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-lg text-sm"
                            >
                              {condition}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-sm">
                            No conditions recorded
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Shield className="w-5 h-5 text-amber-400" />
                        <span className="font-medium">Allergies</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {profile.allergies && profile.allergies.length > 0 ? (
                          profile.allergies.map((allergy, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-lg text-sm"
                            >
                              {allergy}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-sm">
                            No allergies recorded
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Pill className="w-5 h-5 text-cyan-400" />
                        <span className="font-medium">Current Medications</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {profile.medications &&
                        profile.medications.length > 0 ? (
                          profile.medications.map((medication, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-sm"
                            >
                              {medication}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-sm">
                            No medications recorded
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact Sidebar */}
              <div className="space-y-6">
                <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Emergency Contact</h2>
                      <p className="text-slate-400 text-sm">
                        In case of emergency
                      </p>
                    </div>
                  </div>

                  {profile.emergencyContact ? (
                    <div className="space-y-4">
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <User className="w-5 h-5 text-slate-400" />
                          <span className="text-sm text-slate-400">Name</span>
                        </div>
                        <p className="font-medium">
                          {profile.emergencyContact.name}
                        </p>
                      </div>
                      <div className="bg-slate-800/50 rounded-xl p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Phone className="w-5 h-5 text-slate-400" />
                          <span className="text-sm text-slate-400">Phone</span>
                        </div>
                        <p className="font-medium">
                          {profile.emergencyContact.phone}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Users className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                      <p className="text-slate-400">No emergency contact set</p>
                    </div>
                  )}
                </div>

                {/* Health Stats */}
                <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
                  <Heart className="w-8 h-8 text-purple-400 mb-3" />
                  <h3 className="font-bold text-lg mb-2">Health Score</h3>
                  <div className="text-3xl font-bold text-purple-400 mb-2">
                    8.5/10
                  </div>
                  <p className="text-sm text-slate-300">
                    Your profile is complete and up-to-date! 🎯
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-500/20 to-rose-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <User className="w-12 h-12 text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold mb-4">
                  Create Your Health Profile
                </h2>
                <p className="text-slate-400 mb-6 max-w-md">
                  Set up your health information to get personalized insights
                  and better care recommendations.
                </p>
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 rounded-xl font-medium transition-all shadow-lg mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Profile</span>
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-rose-500/20 rounded-xl flex items-center justify-center">
                  <Edit3 className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Edit Health Profile</h2>
                  <p className="text-slate-400 text-sm">
                    Update your health information
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <User className="w-5 h-5 text-orange-400" />
                  <span>Basic Information</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Age"
                    name="age"
                    value={form.age || ""}
                    onChange={handleChange}
                    type="number"
                    placeholder="25"
                  />
                  <InputField
                    label="Gender"
                    name="gender"
                    value={form.gender || ""}
                    onChange={handleChange}
                    placeholder="Male/Female/Other"
                  />
                  <InputField
                    label="Height (cm)"
                    name="height"
                    value={form.height || ""}
                    onChange={handleChange}
                    type="number"
                    placeholder="170"
                  />
                  <InputField
                    label="Weight (kg)"
                    name="weight"
                    value={form.weight || ""}
                    onChange={handleChange}
                    type="number"
                    placeholder="70"
                  />
                  <InputField
                    label="Blood Group"
                    name="bloodGroup"
                    value={form.bloodGroup || ""}
                    onChange={handleChange}
                    placeholder="A+, B-, O+, etc."
                  />
                  <InputField
                    label="Last Checkup"
                    name="lastCheckup"
                    value={form.lastCheckup?.split("T")[0] || ""}
                    onChange={handleChange}
                    type="date"
                  />
                </div>
              </div>

              {/* Medical History */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Stethoscope className="w-5 h-5 text-emerald-400" />
                  <span>Medical History</span>
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-slate-300 font-medium">
                      Medical Conditions
                    </label>
                    <textarea
                      name="medicalConditions"
                      value={form.medicalConditions?.join(", ") || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setForm({
                          ...form,
                          medicalConditions: value
                            ? value
                                .split(",")
                                .map((s) => s.trim())
                                .filter((s) => s.length > 0)
                            : [],
                        });
                      }}
                      placeholder="Diabetes, Hypertension, Heart Disease (separate with commas)"
                      rows={3}
                      className="w-full p-4 rounded-xl bg-slate-800/50 text-white border border-slate-700 focus:border-orange-500 focus:outline-none transition-all placeholder-slate-500 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-slate-300 font-medium">
                      Allergies
                    </label>
                    <textarea
                      name="allergies"
                      value={form.allergies?.join(", ") || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setForm({
                          ...form,
                          allergies: value
                            ? value
                                .split(",")
                                .map((s) => s.trim())
                                .filter((s) => s.length > 0)
                            : [],
                        });
                      }}
                      placeholder="Peanuts, Penicillin, Shellfish (separate with commas)"
                      rows={3}
                      className="w-full p-4 rounded-xl bg-slate-800/50 text-white border border-slate-700 focus:border-orange-500 focus:outline-none transition-all placeholder-slate-500 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-slate-300 font-medium">
                      Current Medications
                    </label>
                    <textarea
                      name="medications"
                      value={form.medications?.join(", ") || ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        setForm({
                          ...form,
                          medications: value
                            ? value
                                .split(",")
                                .map((s) => s.trim())
                                .filter((s) => s.length > 0)
                            : [],
                        });
                      }}
                      placeholder="Aspirin, Metformin, Lisinopril (separate with commas)"
                      rows={3}
                      className="w-full p-4 rounded-xl bg-slate-800/50 text-white border border-slate-700 focus:border-orange-500 focus:outline-none transition-all placeholder-slate-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Users className="w-5 h-5 text-red-400" />
                  <span>Emergency Contact</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Contact Name"
                    name="emergencyContactName"
                    value={form.emergencyContactName || ""}
                    onChange={handleChange}
                    placeholder="John Doe"
                  />
                  <InputField
                    label="Contact Phone"
                    name="emergencyContactPhone"
                    value={form.emergencyContactPhone || ""}
                    onChange={handleChange}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="flex items-center space-x-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition-all"
                >
                  <X className="w-5 h-5" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 rounded-xl font-medium transition-all shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default HealthProfile;

// Helper component for info display
function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 hover:bg-slate-800/70 transition-all">
      <div className="flex items-center space-x-2 mb-2">
        <Icon className="w-5 h-5 text-slate-400" />
        <span className="text-slate-400 text-sm">{label}</span>
      </div>
      <p className="font-medium text-lg">{value || "Not set"}</p>
    </div>
  );
}

// Reusable input component
function InputField({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
}) {
  return (
    <div className="space-y-2">
      <label className="text-slate-300 font-medium">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-4 rounded-xl bg-slate-800/50 text-white border border-slate-700 focus:border-orange-500 focus:outline-none transition-all placeholder-slate-500"
      />
    </div>
  );
}