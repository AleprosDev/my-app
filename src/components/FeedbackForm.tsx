import React, { useState } from "react"
import { HelpCircle, Send, X, Loader2 } from "lucide-react"
import emailjs from '@emailjs/browser'

const FeedbackForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [status, setStatus] = useState<{type: 'success' | 'error' | null, message: string}>({ type: null, message: '' })

  const [formData, setFormData] = useState({
    name: "",
    type: "duda",
    message: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)
    setStatus({ type: null, message: '' })

    // TODO: Reemplazar con tus credenciales de EmailJS (https://www.emailjs.com/)
    const SERVICE_ID = "service_qs143fd" 
    const TEMPLATE_ID = "template_fqr0vd6"
    const PUBLIC_KEY = "0skFIRBOV3THs96_-"

    const templateParams = {
        from_name: formData.name || "Aventurero Anónimo",
        type: formData.type,
        message: formData.message,
    }

    try {
        await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, PUBLIC_KEY)
        setStatus({ type: 'success', message: '¡Mensaje enviado con éxito!' })
        setFormData({ name: "", type: "duda", message: "" })
        setTimeout(() => {
            setIsOpen(false)
            setStatus({ type: null, message: '' })
        }, 3000)
    } catch (error) {
        console.error("Error al enviar email:", error)
        setStatus({ type: 'error', message: 'Error al enviar. Intenta más tarde.' })
    } finally {
        setIsSending(false)
    }
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
            disabled={isSending}
            className={`w-full font-bold py-2 rounded transition-colors flex items-center justify-center gap-2 mt-4 ${
                isSending 
                ? "bg-rpg-light/50 text-rpg-dark cursor-not-allowed" 
                : "bg-rpg-accent text-rpg-dark hover:bg-rpg-light"
            }`}
          >
            {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            {isSending ? "Enviando..." : "Enviar Mensaje"}
          </button>
        </form>

        {status.message && (
            <div className={`mt-4 p-3 rounded text-sm text-center ${
                status.type === 'success' ? 'bg-green-500/20 text-green-200 border border-green-500/50' : 'bg-red-500/20 text-red-200 border border-red-500/50'
            }`}>
                {status.message}
            </div>
        )}

        <div className="mt-8 pt-4 border-t border-rpg-light/10 text-center">
          <p className="text-xs text-rpg-light/40">
            Powered by EmailJS
          </p>
        </div>
      </div>
    </>
  )
}

export default FeedbackForm
