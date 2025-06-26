import React from "react"

type PlayerProps = {
  song: {
    title: string
    artist: string
    duration: string
    coverUrl: string
  }
  isPlaying: boolean
  progress: number
  onPlayPause: () => void
  onSliderChange: (value: number) => void
}

const getDurationSeconds = (duration: string) => {
  const [min, sec] = duration.split(":").map(Number)
  return min * 60 + sec
}

const Player: React.FC<PlayerProps> = ({
  song,
  isPlaying,
  progress,
  onPlayPause,
  onSliderChange,
}) => (
  <div className="fixed left-0 right-0 bottom-0 bg-white border-t shadow-lg px-4 py-3 flex items-center z-50">
    <img
      src={song.coverUrl}
      alt={song.title}
      className="h-12 w-12 rounded mr-4 object-cover"
    />
    <div className="flex-1">
      <div className="font-semibold">{song.title}</div>
      <div className="text-sm text-gray-500">{song.artist}</div>
      <input
        type="range"
        min={0}
        max={getDurationSeconds(song.duration)}
        value={progress}
        onChange={e => onSliderChange(Number(e.target.value))}
        className="w-full mt-2"
      />
      <div className="text-xs text-gray-400 flex justify-between">
        <span>
          {Math.floor(progress / 60)}:{(progress % 60).toString().padStart(2, "0")}
        </span>
        <span>{song.duration}</span>
      </div>
    </div>
    <button
      onClick={onPlayPause}
      className="ml-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300"
    >
      {isPlaying ? "⏸️" : "▶️"}
    </button>
  </div>
)

export default Player