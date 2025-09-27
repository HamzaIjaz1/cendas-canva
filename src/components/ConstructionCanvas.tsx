import { useEffect, useRef, useState } from 'react'
import { useUserStore } from '../store/userStore'
import type { TaskDocType } from '../db/schemas'
import TaskModal from './TaskModal'

interface ConstructionCanvasProps {
  className?: string
}

export default function ConstructionCanvas({ className = '' }: ConstructionCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const pinIconRef = useRef<HTMLImageElement | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [clickCoords, setClickCoords] = useState({ x: 0, y: 0 })
  const [selectedTask, setSelectedTask] = useState<TaskDocType | null>(null)
  
  const { tasks, fetchTasks, isLoadingTasks } = useUserStore()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    const pinIcon = new Image()
    imageRef.current = img
    pinIconRef.current = pinIcon
    
    let imagesLoaded = 0
    const totalImages = 2
    
    const checkAllLoaded = () => {
      imagesLoaded++
      if (imagesLoaded === totalImages) {
        canvas.width = img.width
        canvas.height = img.height
        
        redrawCanvas()
        setImageLoaded(true)
        setError(null)
      }
    }
    
    img.onload = checkAllLoaded
    pinIcon.onload = checkAllLoaded

    img.onerror = () => {
      setError('Failed to load construction plan image')
      setImageLoaded(false)
    }
    
    pinIcon.onerror = () => {
      setError('Failed to load pin icon')
      setImageLoaded(false)
    }

    img.src = '/construction-plan.png'
    pinIcon.src = '/pin-icon.svg'

    return () => {
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [modalOpen, fetchTasks])

  useEffect(() => {
    if (imageLoaded) {
      redrawCanvas()
    }
  }, [tasks, imageLoaded])


  const redrawCanvas = () => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0)

    tasks.forEach(task => {
      drawTaskMarker(ctx, task)
    })
  }

  const drawTaskMarker = (ctx: CanvasRenderingContext2D, task: TaskDocType) => {
    const pinIcon = pinIconRef.current
    if (!pinIcon) return

    const statusColors = {
      not_started: '#9CA3AF',
      in_progress: '#EA580C',
      blocked: '#DC2626',
      final_check: '#2563EB',
      done: '#16A34A',
    }

    const pinWidth = 32
    const pinHeight = 40
    const pinX = task.x - pinWidth / 2
    const pinY = task.y - pinHeight

    const pinBodyWidth = 24
    const pinBodyHeight = 24
    const pinBodyX = task.x - pinBodyWidth / 2
    const pinBodyY = task.y - pinHeight + 4
    
    ctx.fillStyle = statusColors[task.status]
    ctx.beginPath()
    ctx.roundRect(pinBodyX, pinBodyY, pinBodyWidth, pinBodyHeight, 12)
    ctx.fill()
    
    ctx.beginPath()
    ctx.moveTo(task.x, task.y)
    ctx.lineTo(task.x - 8, task.y - 12)
    ctx.lineTo(task.x + 8, task.y - 12)
    ctx.closePath()
    ctx.fill()

    ctx.globalAlpha = 0.8
    ctx.drawImage(pinIcon, pinX, pinY, pinWidth, pinHeight)
    ctx.globalAlpha = 1.0

    const centerRadius = 8
    ctx.beginPath()
    ctx.arc(task.x, task.y - pinHeight + 16, centerRadius, 0, 2 * Math.PI)
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()
    ctx.strokeStyle = statusColors[task.status]
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.font = '12px system-ui, -apple-system, sans-serif'
    ctx.fillStyle = '#1F2937'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    
    const textMetrics = ctx.measureText(task.title)
    const textWidth = textMetrics.width
    const textHeight = 16
    const textX = task.x - textWidth / 2 - 4
    const textY = task.y + 8
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.fillRect(textX, textY, textWidth + 8, textHeight)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)'
    ctx.lineWidth = 1
    ctx.strokeRect(textX, textY, textWidth + 8, textHeight)
    
    ctx.fillStyle = '#1F2937'
    ctx.fillText(task.title, task.x, textY + 2)
  }

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    
    const x = (event.clientX - rect.left) * scaleX
    const y = (event.clientY - rect.top) * scaleY

    const clickedTask = tasks.find(task => {
      const pinWidth = 32
      const pinHeight = 40
      const pinX = task.x - pinWidth / 2
      const pinY = task.y - pinHeight
      
      return x >= pinX && x <= pinX + pinWidth && y >= pinY && y <= task.y + 20
    })

    if (clickedTask) {
      setSelectedTask(clickedTask)
    } else {
      setSelectedTask(null)
    }

    setClickCoords({ x: Math.round(x), y: Math.round(y) })
    setModalOpen(true)
  }
  return (
    <div className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden ${className}`}>
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-700">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading construction plan...</p>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className={`max-w-full h-auto max-h-[70vh] cursor-crosshair ${imageLoaded ? 'block' : 'hidden'}`}
      />
      
      <TaskModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        x={clickCoords.x}
        y={clickCoords.y}
        task={selectedTask}
      />
    </div>
  )
}
