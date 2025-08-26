interface RoleCardProps {
  role: string
  description?: string
  isEvil: boolean
}

const RoleCard = ({ role, description, isEvil }: RoleCardProps) => (
  <div className={`p-6 rounded-2xl border-2 ${isEvil ? 'border-red-400 bg-red-50' : 'border-[#1abc9c] bg-emerald-50'} animate-slide-in`}>
    <h3 className={`text-2xl font-bold mb-2 ${isEvil ? 'text-red-600' : 'text-[#1abc9c]'}`}>
      {role}
    </h3>
    {description && (
      <p className="text-sm text-[#2c3e50] opacity-80">{description}</p>
    )}
  </div>
)

export default RoleCard