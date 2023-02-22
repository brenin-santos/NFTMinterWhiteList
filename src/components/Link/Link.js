import React from "react";

export function Link({ children, href }) {
  return <a href={href}>{children}</a>;
}
