import React from 'react';
import { NavLink } from 'react-router-dom';


const AdminNavLink: React.FC<{ to: string, children: React.ReactNode }> = ({ to, children }) => {
  return (
    <NavLink to={`/admin/${to}`} className="nav-link">
      { children }
    </NavLink>
  )
}

export default AdminNavLink;
