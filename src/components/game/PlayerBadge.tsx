interface PlayerBadgeProps {
  name: string
  role?: string
  isMe?: boolean
}

const PlayerBadge = ({ name, role, isMe }: PlayerBadgeProps) => (
  <div
    className={`px-4 py-2 rounded-full font-medium text-sm ${
      isMe ? 'bg-[#1abc9c] text-white' : 'bg-[#bdc3c7] text-[#2c3e50]'
    } ${role && 'cursor-help'}`}
    title={role}
  >
    {name} {isMe && '(You)'}
  </div>
)

export default PlayerBadge
