import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Song } from "../types"; 

type MutationState = {
  data: Song | null;
  loading: boolean;
  error: string | null;
};

// ✅ useMutation o custom hook para crear canciones

const useCreateSong = () => {
  const [state, setState] = useState<MutationState>({ data: null, loading: false, error: null });

  // llamada a Supabase
  const mutate = async (newSongData: Omit<Song, 'id'>) => {
    setState({ data: null, loading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const createdSong: Song = { ...newSongData, id: Math.floor(Math.random() * 10000) };
      
      setState({ data: createdSong, loading: false, error: null });
    } catch (err) {
      setState({ data: null, loading: false, error: (err as Error).message });
    }
  };

  return { ...state, mutate };
};

const CreateSongForm: React.FC = () => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [duration, setDuration] = useState("");
  const [genre, setGenre] = useState(""); 
  const { mutate, loading, error, data } = useCreateSong();
  const navigate = useNavigate();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    await mutate({ title, artist, duration, genre, album: "placeholder", audio_url: "placeholder" });
  };
  
  React.useEffect(() => {
    if (data) {
      alert(`Canción "${data.title}" creada con éxito.`);
      navigate("/");
    }
  }, [data, navigate]);

  return (
    <div className="p-8 bg-rpg-dark rounded-lg shadow-xl max-w-lg mx-auto mt-10 border border-rpg-accent">
      <h2 className="text-3xl font-bold text-rpg-light mb-6 text-center">Crear Nueva Canción</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-rpg-light/80">Título</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md bg-rpg-secondary/20 border-rpg-secondary text-white shadow-sm focus:border-rpg-primary focus:ring-rpg-primary sm:text-sm p-2 border"
            required
          />
        </div>
        <div>
          <label htmlFor="artist" className="block text-sm font-medium text-rpg-light/80">Artista</label>
          <input
            type="text"
            id="artist"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="mt-1 block w-full rounded-md bg-rpg-secondary/20 border-rpg-secondary text-white shadow-sm focus:border-rpg-primary focus:ring-rpg-primary sm:text-sm p-2 border"
            required
          />
        </div>
        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-rpg-light/80">Duración</label>
          <input
            type="text"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="ej. 3:45"
            className="mt-1 block w-full rounded-md bg-rpg-secondary/20 border-rpg-secondary text-white shadow-sm focus:border-rpg-primary focus:ring-rpg-primary sm:text-sm p-2 border placeholder-rpg-light/30"
            required
          />
        </div>
        <div>
          <label htmlFor="genre" className="block text-sm font-medium text-rpg-light/80">Género</label>
          <input
            type="text"
            id="genre"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="mt-1 block w-full rounded-md bg-rpg-secondary/20 border-rpg-secondary text-white shadow-sm focus:border-rpg-primary focus:ring-rpg-primary sm:text-sm p-2 border"
            required
          />
        </div>

        <button
          type="submit"
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm font-medium transition duration-300 ${loading ? 'bg-rpg-secondary cursor-not-allowed text-white' : 'bg-rpg-primary text-rpg-dark hover:bg-rpg-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rpg-primary'}`}
          disabled={loading}
        >
          {loading ? 'Creando canción...' : 'Crear Canción'}
        </button>

        {error && (
          <p className="mt-2 text-center text-sm text-red-400">
            Error al crear la canción: {error}
          </p>
        )}
      </form>
    </div>
  );
};

export default CreateSongForm;
