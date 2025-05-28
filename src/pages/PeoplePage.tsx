import React, { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Person } from '../types/person';
import { personService } from '../services/personService';
import PersonList from '../components/people/PersonList';
import PersonModal from '../components/people/PersonModal';

interface Company {
  id: string;
  razao_social: string;
}

const PeoplePage: React.FC = () => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [filteredPeople, setFilteredPeople] = useState<Person[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'vendedor' | 'sdr' | 'ambos'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterPeople();
  }, [people, selectedCompanyId, searchTerm, selectedRole]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [companiesData, peopleData] = await Promise.all([
        loadCompanies(),
        loadPeople()
      ]);

      setCompanies(companiesData || []);
      setPeople(peopleData || []);

      if (companiesData.length > 0) {
        setSelectedCompanyId(companiesData[0].id);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCompanies = async () => {
    const { data, error } = await supabase
      .from('empresas')
      .select('id, razao_social')
      .order('razao_social');

    if (error) throw error;
    return data;
  };

  const loadPeople = async () => {
    const data = await personService.getPeople();
    return data;
  };

  const filterPeople = () => {
    let filtered = people;

    if (selectedCompanyId) {
      filtered = filtered.filter(person => person.empresa_id === selectedCompanyId);
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(person => 
        person.cargo.toLowerCase() === selectedRole
      );
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(person =>
        person.nome.toLowerCase().includes(term) ||
        person.codigo.toLowerCase().includes(term) ||
        (person.email && person.email.toLowerCase().includes(term))
      );
    }

    setFilteredPeople(filtered);
  };

  const handleEdit = (person: Person) => {
    setSelectedPerson(person);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta pessoa?')) return;

    try {
      await personService.deletePerson(id);
      const updatedPeople = await loadPeople();
      setPeople(updatedPeople);
    } catch (error) {
      console.error('Erro ao excluir pessoa:', error);
    }
  };

  const handleSave = async () => {
    const updatedPeople = await loadPeople();
    setPeople(updatedPeople);
    setIsModalOpen(false);
    setSelectedPerson(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Pessoas</h2>
          <p className="text-gray-400">Gerencie os vendedores e SDRs cadastrados no sistema.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Nova Pessoa
        </button>
      </div>

      <div className="bg-dark-900/95 backdrop-blur-sm rounded-xl border border-dark-800 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative md:w-1/2">
            <input
              type="text"
              placeholder="Buscar pessoas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary-500"
          >
            <option value="">Todas as empresas</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.razao_social}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => setSelectedRole('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedRole === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedRole('vendedor')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedRole === 'vendedor'
                  ? 'bg-blue-600 text-white'
                  : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
              }`}
            >
              Vendedores
            </button>
            <button
              onClick={() => setSelectedRole('sdr')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedRole === 'sdr'
                  ? 'bg-green-600 text-white'
                  : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
              }`}
            >
              SDRs
            </button>
            <button
              onClick={() => setSelectedRole('ambos')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedRole === 'ambos'
                  ? 'bg-purple-600 text-white'
                  : 'bg-dark-800 text-gray-300 hover:bg-dark-700'
              }`}
            >
              Ambos
            </button>
          </div>
        </div>
      </div>

      <div className="bg-dark-900/95 backdrop-blur-sm rounded-xl border border-dark-800 p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-400">Carregando pessoas...</p>
          </div>
        ) : (
          <PersonList 
            people={filteredPeople}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      <PersonModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPerson(null);
        }}
        onSave={handleSave}
        selectedCompanyId={selectedCompanyId}
        person={selectedPerson}
      />
    </div>
  );
};

export default PeoplePage;