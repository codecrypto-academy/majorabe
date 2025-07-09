// src/components/Header.tsx
import React from 'react';

interface HeaderProps { title: string; }

export default function Header({ title }: HeaderProps) {
  return (
    <h1 className="text-xl font-bold text-gray-800">
        {title}
    </h1>
);
}