import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Users,
  ChevronRight,
  LayoutGrid,
  List as ListIcon,
  Filter,
  X,
  Check,
  User,
  Mic,
  HandHelping
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn, formatDate } from '../lib/utils';

interface Program {
  id: string;
  name: string;
  description: string;
  category: string;
  coordinator: string;
  memberCount: number;
  color: string;
}

interface Event {
  id: string;
  programId: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  preacher?: string;
  prayerLeader?: string;
}

const INITIAL_PROGRAMS: Program[] = [
  { 
    id: 'p1', 
    name: 'Youth Ministry', 
    description: 'Empowering the next generation through faith and fellowship.', 
    category: 'Youth',
    coordinator: 'Sarah Wilson',
    memberCount: 45,
    color: 'bg-indigo-500'
  },
  { 
    id: 'p2', 
    name: 'Men of Valor', 
    description: 'Building strong men of faith through brotherhood and service.', 
    category: 'Men',
    coordinator: 'Robert Brown',
    memberCount: 32,
    color: 'bg-emerald-500'
  },
  { 
    id: 'p3', 
    name: 'Women of Grace', 
    description: 'A community of women growing together in Christ.', 
    category: 'Women',
    coordinator: 'Jane Smith',
    memberCount: 58,
    color: 'bg-rose-500'
  },
  { 
    id: 'p4', 
    name: 'Sunday School', 
    description: 'Foundational biblical teaching for children of all ages.', 
    category: 'Education',
    coordinator: 'Michael Gebre',
    memberCount: 120,
    color: 'bg-amber-500'
  },
];

const INITIAL_EVENTS: Event[] = [
  {
    id: 'e1',
    programId: 'p1',
    title: 'Youth Night: Game Night',
    date: '2024-03-15',
    time: '18:30',
    location: 'Main Hall',
    description: 'A fun night of games and fellowship for all youth.',
    preacher: 'Sarah Wilson',
    prayerLeader: 'John Doe'
  },
  {
    id: 'e2',
    programId: 'p2',
    title: 'Men\'s Breakfast',
    date: '2024-03-16',
    time: '08:00',
    location: 'Church Kitchen',
    description: 'Monthly breakfast and prayer meeting for men.',
    preacher: 'Robert Brown',
    prayerLeader: 'Michael Gebre'
  },
  {
    id: 'e3',
    programId: 'p3',
    title: 'Women\'s Bible Study',
    date: '2024-03-14',
    time: '10:00',
    location: 'Room 204',
    description: 'Weekly study through the book of Philippians.',
    preacher: 'Jane Smith',
    prayerLeader: 'Sarah Wilson'
  },
];

export function Programs() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';
  
  const [programs, setPrograms] = useState<Program[]>(INITIAL_PROGRAMS);
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Modal states
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  
  // Form states - Program
  const [programForm, setProgramForm] = useState({
    name: '',
    description: '',
    category: 'General',
    coordinator: '',
    color: 'bg-emerald-500'
  });

  // Form states - Event
  const [eventForm, setEventForm] = useState({
    programId: '',
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    preacher: '',
    prayerLeader: ''
  });

  const categories = ['All', ...new Set(programs.map(p => p.category))];

  const filteredPrograms = programs.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    const newProgram: Program = {
      id: `p${Date.now()}`,
      ...programForm,
      memberCount: 0
    };
    setPrograms([...programs, newProgram]);
    setShowProgramModal(false);
    setProgramForm({
      name: '',
      description: '',
      category: 'General',
      coordinator: '',
      color: 'bg-emerald-500'
    });
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent: Event = {
      id: `e${Date.now()}`,
      ...eventForm
    };
    setEvents([...events, newEvent]);
    setShowEventModal(false);
    setEventForm({
      programId: '',
      title: '',
      date: '',
      time: '',
      location: '',
      description: '',
      preacher: '',
      prayerLeader: ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Church Programs</h1>
          <p className="text-slate-500">Manage and explore ministries and upcoming events.</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button 
              onClick={() => setShowEventModal(true)}
              className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl font-bold transition-all shadow-sm"
            >
              <Calendar size={20} className="text-emerald-600" />
              Weekly Program
            </button>
            <button 
              onClick={() => setShowProgramModal(true)}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-100"
            >
              <Plus size={20} />
              New Program
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none text-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                viewMode === 'grid' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn(
                "p-1.5 rounded-lg transition-all",
                viewMode === 'list' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <ListIcon size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
          <Filter size={16} className="text-slate-400 shrink-0" />
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all",
                selectedCategory === category 
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-100" 
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Programs List */}
        <div className="lg:col-span-2 space-y-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPrograms.map(program => (
                <div key={program.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-200 transition-all group overflow-hidden">
                  <div className={cn("h-2", program.color)} />
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md mb-2 inline-block">
                          {program.category}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{program.name}</h3>
                      </div>
                      {isAdmin && (
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-all">
                          <MoreVertical size={18} />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-6">{program.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold">
                          {program.coordinator.charAt(0)}
                        </div>
                        <div className="text-[10px]">
                          <p className="font-bold text-slate-700">{program.coordinator}</p>
                          <p className="text-slate-400">Coordinator</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Users size={14} />
                        <span className="text-xs font-bold">{program.memberCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="divide-y divide-slate-100">
                {filteredPrograms.map(program => (
                  <div key={program.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-100", program.color)}>
                        <Users size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{program.name}</h3>
                        <p className="text-xs text-slate-500">{program.category} • {program.coordinator}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-slate-700">{program.memberCount}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Members</p>
                      </div>
                      <ChevronRight size={20} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {filteredPrograms.length === 0 && (
            <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mx-auto mb-4">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No programs found</h3>
              <p className="text-slate-500 mt-1">Try adjusting your search or category filters.</p>
            </div>
          )}
        </div>

        {/* Upcoming Events Sidebar */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-slate-900 flex items-center gap-2">
                <Calendar size={18} className="text-emerald-600" />
                Upcoming Events
              </h2>
              <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700">View All</button>
            </div>
            <div className="space-y-4">
              {events.map(event => {
                const program = programs.find(p => p.id === event.programId);
                return (
                  <div key={event.id} className="relative pl-4 border-l-2 border-slate-100 hover:border-emerald-500 transition-all group">
                    <div className="mb-1">
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md text-white", program?.color)}>
                        {program?.name}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{event.title}</h4>
                    
                    <div className="mt-2 space-y-1.5">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <Calendar size={12} />
                        {formatDate(event.date)}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <Clock size={12} />
                        {event.time}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <MapPin size={12} />
                        {event.location}
                      </div>
                      
                      {(event.preacher || event.prayerLeader) && (
                        <div className="pt-2 mt-2 border-t border-slate-50 space-y-1">
                          {event.preacher && (
                            <div className="flex items-center gap-2 text-[10px] text-slate-600">
                              <Mic size={10} className="text-emerald-500" />
                              <span className="font-bold">Preacher:</span> {event.preacher}
                            </div>
                          )}
                          {event.prayerLeader && (
                            <div className="flex items-center gap-2 text-[10px] text-slate-600">
                              <HandHelping size={10} className="text-indigo-500" />
                              <span className="font-bold">Prayer:</span> {event.prayerLeader}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {events.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4 italic">No upcoming events scheduled.</p>
              )}
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-xl shadow-slate-200 overflow-hidden relative">
            <div className="relative z-10">
              <h3 className="font-bold text-lg mb-2">Need a new program?</h3>
              <p className="text-slate-400 text-sm mb-6">Administrators can create new ministries and assign coordinators.</p>
              <button className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-all">
                Contact Admin
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute -left-4 -top-4 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>

      {/* New Program Modal */}
      {showProgramModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Plus size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">New Program</h2>
                  <p className="text-xs text-slate-500 font-medium">Create a new ministry or department.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowProgramModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateProgram} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Program Name</label>
                <input 
                  required
                  type="text" 
                  value={programForm.name}
                  onChange={(e) => setProgramForm({...programForm, name: e.target.value})}
                  placeholder="e.g., Youth Ministry"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
                <select 
                  value={programForm.category}
                  onChange={(e) => setProgramForm({...programForm, category: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                >
                  <option value="Youth">Youth</option>
                  <option value="Men">Men</option>
                  <option value="Women">Women</option>
                  <option value="Education">Education</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Coordinator</label>
                <input 
                  required
                  type="text" 
                  value={programForm.coordinator}
                  onChange={(e) => setProgramForm({...programForm, coordinator: e.target.value})}
                  placeholder="e.g., Sarah Wilson"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                <textarea 
                  required
                  rows={3}
                  value={programForm.description}
                  onChange={(e) => setProgramForm({...programForm, description: e.target.value})}
                  placeholder="Describe the program's purpose..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowProgramModal(false)}
                  className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200/50"
                >
                  <Check size={18} />
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Weekly Program (Event) Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Calendar size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Weekly Program</h2>
                  <p className="text-xs text-slate-500 font-medium">Schedule a new weekly event or service.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEventModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateEvent} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Select Program</label>
                <select 
                  required
                  value={eventForm.programId}
                  onChange={(e) => setEventForm({...eventForm, programId: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                >
                  <option value="">Select a program...</option>
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Event Title</label>
                <input 
                  required
                  type="text" 
                  value={eventForm.title}
                  onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                  placeholder="e.g., Sunday Morning Service"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
                  <input 
                    required
                    type="date" 
                    value={eventForm.date}
                    onChange={(e) => setEventForm({...eventForm, date: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Time</label>
                  <input 
                    required
                    type="time" 
                    value={eventForm.time}
                    onChange={(e) => setEventForm({...eventForm, time: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Location</label>
                <input 
                  required
                  type="text" 
                  value={eventForm.location}
                  onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                  placeholder="e.g., Main Sanctuary"
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
                    <Mic size={14} className="text-emerald-500" />
                    Preacher
                  </label>
                  <input 
                    type="text" 
                    value={eventForm.preacher}
                    onChange={(e) => setEventForm({...eventForm, preacher: e.target.value})}
                    placeholder="Name of preacher"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-slate-50/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-2">
                    <HandHelping size={14} className="text-indigo-500" />
                    Prayer Leader
                  </label>
                  <input 
                    type="text" 
                    value={eventForm.prayerLeader}
                    onChange={(e) => setEventForm({...eventForm, prayerLeader: e.target.value})}
                    placeholder="Name of prayer leader"
                    className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all bg-slate-50/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                <textarea 
                  rows={2}
                  value={eventForm.description}
                  onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                  placeholder="Additional details..."
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200/50"
                >
                  <Check size={18} />
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
