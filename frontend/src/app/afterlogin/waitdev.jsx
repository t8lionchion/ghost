"use client"
export function ComingSoonSection({ id, icon, title, hint }) {
  return (
    <li className="list-group-item bg-transparent">
      <a
        className="text-light text-decoration-none d-flex justify-content-between align-items-center"
        data-bs-toggle="collapse"
        href={`#${id}`}
        role="button"
        aria-controls={id}
      >
        <span className="d-flex align-items-center">
          <i className={`bi ${icon} fs-5 me-2`} />
          {title}
          <span className="badge bg-secondary ms-2">開發中</span>
        </span>
        <i className="bi bi-chevron-down" />
      </a>

      <ul className="list-group list-group-flush ps-3 collapse" id={id}>
        <li className="list-group-item bg-transparent text-light d-flex justify-content-between align-items-center">
          <span>{hint || "此功能正在開發，近期上線。"}</span>
          <button className="btn btn-outline-secondary" disabled>開發中</button>
        </li>
      </ul>
    </li>
  );
}
