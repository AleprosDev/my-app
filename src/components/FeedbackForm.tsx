import React, { useState } from "react"
import { HelpCircle, Send, X } from "lucide-react"

const FeedbackForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "duda",
    message: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const subject = `[Feedback - ${formData.type.toUpperCase()}] ${formData.name}`
    const body = `Nombre: ${formData.name}%0D%0ATipo: ${formData.type}%0D%0A%0D%0AMensaje:%0D%0A${formData.message}`
    
    window.open(`mailto:alejandro.f.pros@gmail.com?subject=${subject}&body=${body}`, '_blank')
    
    // Opcional: limpiar formulario o cerrar
    setIsOpen(false)
    setFormData({ name: "", type: "duda", message: "" })
  }

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-4 bottom-24 z-40 p-3 rounded-full shadow-lg transition-all duration-300 border-2 ${
          isOpen 
            ? "bg-rpg-light text-rpg-dark border-rpg-primary rotate-90" 
            : "bg-rpg-primary text-rpg-dark border-rpg-light hover:scale-110"
        }`}
        title="Enviar Feedback o Reportar Problema"
      >
        {isOpen ? <X size={24} /> : <HelpCircle size={24} />}
      </button>

      {/* Panel lateral */}
      <div 
        className={`fixed right-0 top-0 bottom-0 w-80 bg-rpg-dark/95 border-l-2 border-rpg-accent shadow-2xl transform transition-transform duration-300 z-30 p-6 pt-24 overflow-y-auto backdrop-blur-sm ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <h2 className="text-xl font-bold text-rpg-light mb-4 flex items-center gap-2">
          <HelpCircle className="text-rpg-primary" />
          Feedback & Soporte
        </h2>
        
        <p className="text-sm text-rpg-light/70 mb-6">
          ¿Tienes alguna duda, sugerencia o encontraste un error? ¡Cuéntanos!
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-rpg-primary mb-1">Tu Nombre (Opcional)</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-rpg-secondary/20 border border-rpg-light/20 rounded p-2 text-white focus:border-rpg-primary focus:outline-none transition-colors"
              placeholder="Aventurero Anónimo"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-rpg-primary mb-1">Tipo de Mensaje</label>
            <select
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
              className="w-full bg-rpg-secondary/20 border border-rpg-light/20 rounded p-2 text-white focus:border-rpg-primary focus:outline-none transition-colors"
            >
              <option value="duda">Duda / Consulta</option>
              <option value="mejora">Sugerencia de Mejora</option>
              <option value="problema">Reportar Problema</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-rpg-primary mb-1">Mensaje</label>
            <textarea
              required
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
              className="w-full h-32 bg-rpg-secondary/20 border border-rpg-light/20 rounded p-2 text-white focus:border-rpg-primary focus:outline-none transition-colors resize-none"
              placeholder="Escribe tu mensaje aquí..."
            />
          </div>

          <button
            type="submit"
            className="w-full bg-rpg-accent text-rpg-dark font-bold py-2 rounded hover:bg-rpg-light transition-colors flex items-center justify-center gap-2 mt-4"
          >
            <Send size={18} />
            Enviar Correo
          </button>
        </form>

        <div className="mt-8 pt-4 border-t border-rpg-light/10 text-center">
          <p className="text-xs text-rpg-light/40">
            Se abrirá tu cliente de correo predeterminado para enviar el mensaje a alejandro.f.pros@gmail.com
          </p>
        </div>
      </div>
    </>
  )
}

export default FeedbackForm
