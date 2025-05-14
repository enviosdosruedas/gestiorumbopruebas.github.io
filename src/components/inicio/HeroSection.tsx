
'use client';

import { motion } from 'framer-motion'; // Para animaciones sutiles

export function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="py-12 md:py-20 text-center bg-gradient-to-b from-background to-muted/50 rounded-lg shadow-inner"
    >
      <div className="container mx-auto px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-primary">
          Bienvenido a Rumbo Envios
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Gestione eficientemente sus clientes, repartidores y operaciones de reparto.
          Acceda a todas las herramientas necesarias para optimizar su logística.
        </p>
      </div>
    </motion.div>
  );
}
