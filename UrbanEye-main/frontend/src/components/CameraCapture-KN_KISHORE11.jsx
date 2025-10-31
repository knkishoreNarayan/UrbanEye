import React, { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Camera, RotateCcw, CheckCircle, Mic, Square, Play, Pause } from 'lucide-react'

const CameraCapture = ({ onPhotoCapture, onVoiceRecording, className = "" }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const [isCameraActive, setIsCameraActive] = useState(false)
  const [capturedPhoto, setCapturedPhoto] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState(null)
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
    setError(null)               // small UX tweak
    startCamera()
  }

  const confirmPhoto = () => {
    if (onPhotoCapture && capturedPhoto) {
      onPhotoCapture(capturedPhoto)
    }
  }

  // Voice recording functions
  const startRecording = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      audioChunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        const audioUrl = URL.createObjectURL(audioBlob)
        const audioFile = new File([audioBlob], 'voice_note.wav', { type: 'audio/wav' })
        
        const recordingData = {
          blob: audioBlob,
          file: audioFile,
          url: audioUrl,
          timestamp: new Date().toISOString()
        }
        
        setRecordedAudio(recordingData)
        if (onVoiceRecording) {
          onVoiceRecording(recordingData)
        }
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Recording error:', error)
      setError('Unable to access microphone. Please check browser permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }

  const playRecording = () => {
    if (recordedAudio && recordedAudio.url) {
      const audio = new Audio(recordedAudio.url)
      audio.play()
    }
  }

  const retakeRecording = () => {
    setRecordedAudio(null)
    if (recordedAudio && recordedAudio.url) {
      URL.revokeObjectURL(recordedAudio.url)
    }
  }

  return (
    <div className={`space-y-4 ${className} w-full`}>
      {/* Photo Capture Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-civic-dark">📸 Attach Photo Evidence</CardTitle>
          <p className="text-sm text-civic-text">Take a photo to document the issue visually</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden border-2 border-dashed border-gray-300">
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
                <Camera className="h-12 w-12 text-gray-400 mb-2" />
                <p className="text-gray-600 mb-3">No photo captured yet</p>
                <Button type="button" onClick={startCamera} className="bg-civic-accent hover:bg-civic-accent/90">
                  <Camera className="h-4 w-4 mr-2" />
                  Start Camera
                </Button>
              </div>
            )}
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}

          <canvas ref={canvasRef} className="hidden" />

          <div className="flex justify-center space-x-3">
            {isCameraActive && !capturedPhoto && (
              <Button type="button" onClick={capturePhoto} className="bg-civic-accent hover:bg-civic-accent/90">
                <Camera className="h-4 w-4 mr-2" />
                Capture Photo
              </Button>
            )}
            {capturedPhoto && (
              <>
                <Button type="button" variant="outline" onClick={retakePhoto}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retake
                </Button>
                <Button type="button" className="bg-green-600 text-white hover:bg-green-700" onClick={confirmPhoto}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Use Photo
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Voice Recording Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-civic-dark">🎤 Add Voice Description (optional)</CardTitle>
          <p className="text-sm text-civic-text">Record additional details about the issue</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 min-h-[100px] flex items-center justify-center">
            {recordedAudio ? (
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Voice note recorded</p>
                <div className="flex justify-center space-x-2">
                  <Button type="button" variant="outline" size="sm" onClick={playRecording}>
                    <Play className="h-4 w-4 mr-1" />
                    Play
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={retakeRecording}>
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Retake
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <Mic className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-3">No voice note recorded</p>
                <Button 
                  type="button" 
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-civic-accent hover:bg-civic-accent/90'} text-white`}
                >
                  {isRecording ? (
                    <>
                      <Square className="h-4 w-4 mr-2" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      Start Recording
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CameraCapture
