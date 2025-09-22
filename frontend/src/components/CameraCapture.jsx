import React, { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Camera, RotateCcw, CheckCircle } from 'lucide-react'

const CameraCapture = ({ onPhotoCapture, onRetakePhoto, className = "" }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [isCameraActive, setIsCameraActive] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState(null)
  const [error, setError] = useState(null)

  const startCamera = async () => {
    try {
      setError(null)
      if (streamRef.current) stopCamera()

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      })

      streamRef.current = stream
      setIsCameraActive(true)

      if (videoRef.current) {
        const v = videoRef.current
        v.srcObject = stream
        v.muted = true
        v.playsInline = true

        await new Promise((resolve) => {
          const ready = () => {
            v.removeEventListener('loadedmetadata', ready)
            resolve()
          }
          if (v.readyState >= 1) resolve()
          else v.addEventListener('loadedmetadata', ready)
        })

        await v.play().catch(err => {
          console.error("Video play error:", err)
        })
      }
    } catch (error) {
      console.error('Camera error:', error)
      setError('Unable to access camera. Please check browser permissions and HTTPS.')
      setIsCameraActive(false)
    }
  }

  const stopCamera = () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      if (videoRef.current) {
        try { videoRef.current.pause() } catch {}
        videoRef.current.srcObject = null
      }
    } finally {
      setIsCameraActive(false)
    }
  }

  useEffect(() => {
    return () => stopCamera()
  }, [])

  const setVideoRef = (node) => {
    videoRef.current = node
    if (node && streamRef.current) {
      node.srcObject = streamRef.current
      node.muted = true
      node.playsInline = true
      node.play().catch(err => {
        console.error("Video play error (callback ref):", err)
      })
    }
  }

  const capturePhoto = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    if (video.readyState < 2 || !video.videoWidth || !video.videoHeight) {
      setError('Video not ready yet. Please try again in a moment.')
      return
    }

    const context = canvas.getContext('2d')
    if (!context) {
      setError('Could not get canvas context.')
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob((blob) => {
      if (!blob) {
        setError('Failed to create image blob.')
        return
      }

      const file = new File([blob], "complaint.jpg", { type: "image/jpeg" })
      const photoData = {
        blob,
        file,
        dataUrl: canvas.toDataURL('image/jpeg', 0.8),
        timestamp: new Date().toISOString()
      }
      setCapturedPhoto(photoData)
      stopCamera()
    }, 'image/jpeg', 0.8)
  }

  const retakePhoto = () => {
    setCapturedPhoto(null)
    setError(null)
    if (onRetakePhoto) {
      onRetakePhoto()
    }
    startCamera()
  }

  const confirmPhoto = () => {
    if (onPhotoCapture && capturedPhoto) {
      onPhotoCapture(capturedPhoto)
    }
  }

  return (
    <div className={`space-y-4 ${className} w-full`}>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            Attach Photo 
            <span className="text-red-500 ml-1">*</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden">
            {isCameraActive && !capturedPhoto ? (
              <video
                ref={setVideoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : capturedPhoto ? (
              <img
                src={capturedPhoto.dataUrl}
                alt="Captured photo preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Camera className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Photo is required for complaint submission</p>
                <Button type="button" onClick={startCamera}>
                  <Camera className="h-5 w-5 mr-2" />
                  Start Camera
                </Button>
              </div>
            )}
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <canvas ref={canvasRef} className="hidden" />

          <div className="flex justify-center space-x-3">
            {isCameraActive && !capturedPhoto && (
              <Button type="button" onClick={capturePhoto}>
                <Camera className="h-5 w-5 mr-2" />
                Capture
              </Button>
            )}
            {capturedPhoto && (
              <>
                <div className="text-center mb-2">
                  <p className="text-sm text-green-600 font-medium">✓ Photo captured successfully</p>
                </div>
                <Button type="button" variant="outline" onClick={retakePhoto}>
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Retake
                </Button>
                <Button type="button" className="bg-green-600 text-white" onClick={confirmPhoto}>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Use Photo
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CameraCapture
