"use client"

import { useState } from "react"
import { X, AlertTriangle, Trash2, Loader } from "lucide-react"

const DeleteConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Delete Grievance", 
  message = "Are you sure you want to delete this grievance?",
  confirmText = "DELETE",
  isLoading = false,
  grievance = null,
  isBulk = false,
  selectedCount = 0
}) => {
  const [confirmationInput, setConfirmationInput] = useState("")
  const [step, setStep] = useState(1) // 1: Initial confirmation, 2: Type to confirm

  if (!isOpen) return null

  const handleInitialConfirm = () => {
    setStep(2)
  }

  const handleFinalConfirm = () => {
    if (confirmationInput === confirmText) {
      onConfirm()
    }
  }

  const handleClose = () => {
    setStep(1)
    setConfirmationInput("")
    onClose()
  }

  const isConfirmationValid = confirmationInput === confirmText

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{title}</h2>
              <p className="text-slate-400 text-sm">
                {isBulk ? `${selectedCount} grievances selected` : "Permanent action"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            /* Step 1: Initial Confirmation */
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400 font-medium mb-2">⚠️ Warning</p>
                <p className="text-slate-300 text-sm">
                  {isBulk 
                    ? `You are about to permanently delete ${selectedCount} grievances. This action cannot be undone.`
                    : message
                  }
                </p>
              </div>

              {grievance && !isBulk && (
                <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">Grievance Details:</h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-slate-300">
                      <span className="text-slate-400">Title:</span> {grievance.title}
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">ID:</span> {grievance._id}
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">Status:</span> {grievance.status}
                    </p>
                    <p className="text-slate-300">
                      <span className="text-slate-400">Citizen:</span> {grievance.citizen?.name || "Anonymous"}
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">This will:</h4>
                <ul className="space-y-1 text-sm text-slate-300">
                  <li>• Permanently remove the grievance(s) from the system</li>
                  <li>• Delete all associated files and attachments</li>
                  <li>• Remove the grievance from officer workloads</li>
                  <li>• Create an audit trail entry</li>
                </ul>
              </div>
            </div>
          ) : (
            /* Step 2: Type to Confirm */
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <p className="text-red-400 font-medium mb-2">Final Confirmation Required</p>
                <p className="text-slate-300 text-sm mb-3">
                  Type <span className="font-mono bg-slate-700 px-1 rounded text-red-400">{confirmText}</span> to confirm deletion:
                </p>
                <input
                  type="text"
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                  placeholder={`Type "${confirmText}" to confirm`}
                  autoFocus
                />
              </div>

              {confirmationInput && !isConfirmationValid && (
                <p className="text-red-400 text-sm">
                  Please type "{confirmText}" exactly as shown
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700/50 transition-all"
          >
            Cancel
          </button>
          
          {step === 1 ? (
            <button
              onClick={handleInitialConfirm}
              className="px-6 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Continue
            </button>
          ) : (
            <button
              onClick={handleFinalConfirm}
              disabled={!isConfirmationValid || isLoading}
              className="px-6 py-2 bg-red-500 rounded-lg text-white font-medium hover:bg-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete {isBulk ? `${selectedCount} Grievances` : "Grievance"}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmationModal