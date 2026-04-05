// Renders the item's permanent snide remark in consistent style
export default function SnideRemark({ remark }) {
  if (!remark) return null
  return (
    <p className="text-sm italic mt-3" style={{ color: '#555555' }}>
      {remark}
    </p>
  )
}
