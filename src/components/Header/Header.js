import React from "react";
import { Container } from "./style";

import { Link } from "../Link";

export function Header() {
  return (
    <Container>
      <Link href="https://twitter.com.br">
        <img src="img/twitter.png" alt="Twitter" className="twitter-icon" />
      </Link>
      <Link href="https://twitter.com.br">
        <img
          src="img/etherscan.png"
          alt="Etherscan"
          className="etherscan-icon"
        />
      </Link>
      <Link href="https://twitter.com.br">
        <img src="img/opensea.png" alt="Twitter" className="openSea-icon" />
      </Link>
    </Container>
  );
}
