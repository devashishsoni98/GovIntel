import { useState } from "react"
import { 
  FileText, 
  ImageIcon, 
  Video, 
  Mic, 
  Download, 
  Eye, 
  X, 
  Loader,
  AlertTriangle,
  ExternalLink
} from "lucide-react"

const FilePreview = ({ attachment, onClose }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  
  const getFileUrl = (attachment) => {
    const baseUrl = import.meta.env.VITE_UPLOAD_URL || 'http://localhost:5000'
    const filename = attachment.relativePath || attachment.filename || attachment.path.split('/').pop()
    return `${baseUrl}/api/files/${filename}`
  }
  
  const handleDownload = async () => {
    try {
      const url = getFileUrl(attachment)
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error('Download failed')
      }
      
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = attachment.originalName || attachment.filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download file')
    }
  }
  
  const isImage = attachment.mimetype.startsWith('image/')
  const isVideo = attachment.mimetype.startsWith('video/')
  const isAudio = attachment.mimetype.startsWith('audio/')
  const isPDF = attachment.mimetype.includes('pdf')
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              {isImage && <ImageIcon className="w-4 h-4 text-blue-400" />}
              {isVideo && <Video className="w-4 h-4 text-purple-400" />}
              {isAudio && <Mic className="w-4 h-4 text-green-400" />}
              {!isImage && !isVideo && !isAudio && <FileText className="w-4 h-4 text-slate-400" />}
            </div>
            <div>
              <h3 className="text-white font-medium">{attachment.originalName}</h3>
              <p className="text-slate-400 text-sm">
                {attachment.size ? `${(attachment.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'} • {attachment.mimetype}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all hover:scale-110"
              title="Download file"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all hover:scale-110"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 max-h-[calc(90vh-120px)] overflow-auto">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 text-slate-400 animate-spin" />
              <span className="ml-2 text-slate-400">Loading preview...</span>
            </div>
          )}
          
          {error && (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="w-12 h-12 text-red-400 mb-4" />
              <p className="text-red-400 mb-4">Failed to load preview</p>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-all"
              >
                <Download className="w-4 h-4" />
                Download File
              </button>
            </div>
          )}
          
          {isImage && !error && (
            <img
              src={getFileUrl(attachment)}
              alt={attachment.originalName}
              className="max-w-full max-h-full object-contain mx-auto rounded-lg"
              onLoad={() => setLoading(false)}
              onError={() => {
                setError(true)
                setLoading(false)
              }}
            />
          )}
          
          {isVideo && !error && (
            <video
              src={getFileUrl(attachment)}
              className="max-w-full max-h-full mx-auto rounded-lg"
              controls
              onLoadedData={() => setLoading(false)}
              onError={() => {
                setError(true)
                setLoading(false)
              }}
            />
          )}
          
          {isAudio && !error && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
                <Mic className="w-12 h-12 text-green-400" />
              </div>
              <audio
                src={getFileUrl(attachment)}
                className="w-full max-w-md"
                controls
                onLoadedData={() => setLoading(false)}
                onError={() => {
                  setError(true)
                  setLoading(false)
                }}
              />
            </div>
          )}
          
          {isPDF && !error && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-12 h-12 text-red-400" />
              </div>
              <p className="text-white font-medium mb-2">{attachment.originalName}</p>
              <p className="text-slate-400 text-sm mb-6">PDF files cannot be previewed in browser</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300 hover:bg-red-500/30 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <a
                  href={getFileUrl(attachment)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/30 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in New Tab
                </a>
              </div>
            </div>
          )}
          
          {!isImage && !isVideo && !isAudio && !isPDF && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-24 h-24 bg-slate-500/20 rounded-full flex items-center justify-center mb-6">
                <FileText className="w-12 h-12 text-slate-400" />
              </div>
              <p className="text-white font-medium mb-2">{attachment.originalName}</p>
              <p className="text-slate-400 text-sm mb-6">Preview not available for this file type</p>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-500/20 border border-slate-500/30 rounded-lg text-slate-300 hover:bg-slate-500/30 transition-all"
              >
                <Download className="w-4 h-4" />
                Download File
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FilePreview