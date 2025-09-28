"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';

const formSchema = z.object({
  prompt: z.string().min(1, 'Informe um prompt'),
  negative_prompt: z.string().optional(),
  model: z.string().default('default'),
  style: z.string().optional(),
  width: z.coerce.number().min(64).max(2048),
  height: z.coerce.number().min(64).max(2048),
  steps: z.coerce.number().min(1).max(100)
});

export default function GenerateForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    prompt: '',
    negative_prompt: '',
    model: 'default',
    style: '',
    width: 512,
    height: 512,
    steps: 30
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cost, setCost] = useState(1);

  // Atualiza o custo quando largura/altura mudam
  const recalcCost = (w: number, h: number) => {
    const base = 512 * 512;
    const area = w * h;
    const tokens = Math.ceil(area / base);
    setCost(tokens);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // Atualiza o estado e recalcula o custo dentro do callback
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'width' || name === 'height') {
        const newW = name === 'width' ? Number(value) : Number(updated.width);
        const newH = name === 'height' ? Number(value) : Number(updated.height);
        recalcCost(newW, newH);
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = formSchema.safeParse(formData);
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? 'Dados inválidos');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data)
      });
      if (res.ok) {
        const json = await res.json();
        router.push(`/my-gallery?id=${json.id}`);
      } else {
        const json = await res.json();
        setError(json.message || 'Erro ao enviar geração');
      }
    } catch (err) {
      console.error(err);
      setError('Erro ao enviar geração');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto">
      <div>
        <label className="block mb-1" htmlFor="prompt">Prompt</label>
        <textarea
          id="prompt"
          name="prompt"
          value={formData.prompt}
          onChange={handleChange}
          className="w-full bg-surface border border-border rounded-md p-2 text-text"
          rows={4}
          required
        />
      </div>
      <div>
        <label className="block mb-1" htmlFor="negative_prompt">Prompt negativo (opcional)</label>
        <textarea
          id="negative_prompt"
          name="negative_prompt"
          value={formData.negative_prompt}
          onChange={handleChange}
          className="w-full bg-surface border border-border rounded-md p-2 text-text"
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block mb-1" htmlFor="model">Modelo</label>
          <select
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            className="w-full bg-surface border border-border rounded-md p-2 text-text"
          >
            <option value="default">Padrão</option>
            <option value="anime">Anime</option>
            <option value="photo">Fotorealista</option>
          </select>
        </div>
        <div>
          <label className="block mb-1" htmlFor="style">Estilo (opcional)</label>
          <input
            id="style"
            name="style"
            type="text"
            value={formData.style}
            onChange={handleChange}
            className="w-full bg-surface border border-border rounded-md p-2 text-text"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block mb-1" htmlFor="width">Largura</label>
          <input
            id="width"
            name="width"
            type="number"
            value={formData.width}
            onChange={handleChange}
            className="w-full bg-surface border border-border rounded-md p-2 text-text"
            min={64}
            max={2048}
            step={64}
            required
          />
        </div>
        <div>
          <label className="block mb-1" htmlFor="height">Altura</label>
          <input
            id="height"
            name="height"
            type="number"
            value={formData.height}
            onChange={handleChange}
            className="w-full bg-surface border border-border rounded-md p-2 text-text"
            min={64}
            max={2048}
            step={64}
            required
          />
        </div>
        <div>
          <label className="block mb-1" htmlFor="steps">Passos</label>
          <input
            id="steps"
            name="steps"
            type="number"
            value={formData.steps}
            onChange={handleChange}
            className="w-full bg-surface border border-border rounded-md p-2 text-text"
            min={1}
            max={100}
            required
          />
        </div>
      </div>
      <div className="mt-2 text-sm text-muted">
        Custo estimado: <span className="font-semibold text-primary">{cost}</span> tokens
      </div>
      {error && <p className="text-danger text-sm">{error}</p>}
      <button
        type="submit"
        className="btn-primary w-full"
        disabled={loading}
      >
        {loading ? 'Enviando...' : 'Gerar imagem'}
      </button>
    </form>
  );
}
