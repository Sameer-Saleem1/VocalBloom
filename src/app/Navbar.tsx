"use client";

import { Navbar, Nav, Container } from "react-bootstrap";
import Link from "next/link";

export default function MyNavbar() {
  return (
    <Navbar expand="lg">
      <Container>
        <Navbar.Brand as={Link} href="/">
          SpeechJourney
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} href="/">
              Home
            </Nav.Link>
            <Nav.Link as={Link} href="/about">
              About
            </Nav.Link>
            <Nav.Link as={Link} href="/contact">
              Contact
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
