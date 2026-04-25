export default function SectionCard({ title, children, actions }) {
  return (
    <div className="cd">
      <div className="cd-h">
        <div className="cd-t">{title}</div>
        {actions && <div>{actions}</div>}
      </div>
      <div className="cd-b">{children}</div>
    </div>
  );
}
