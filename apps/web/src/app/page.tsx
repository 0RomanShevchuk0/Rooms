'use client';
import Link from "next/link";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { io } from "socket.io-client";
import { useEffect } from "react";

export default function Page() {

  useEffect(() => {
    const socket = io('http://localhost:4000/events');
    socket.on('connect', () => {
      console.log('Connected to server');

      socket.emit('events', { test: 'test' });
    });

    socket.on('events', function (data) {
      console.log('event', data);
    });
    socket.on('disconnect', function () {
      console.log('Disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl border border-border bg-primary/10" />
            <div>
              <p className="text-sm font-semibold">Rooms</p>
              <p className="text-xs text-muted-foreground">Real-time rooms</p>
            </div>
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Create a room. Share a link. Start playing.
            </h1>
            <p className="max-w-xl text-base text-muted-foreground">
              Minimal, fast, and focused on real-time play.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/room">Create room</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/room">Join with code</Link>
              </Button>
            </div>
          </div>

          <Card className="border-border/60">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <CardTitle>Room #A9K2</CardTitle>
                <Badge variant="outline">Starts in 00:08</Badge>
              </div>
              <CardDescription>Two-player Snake preview.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span>Player 1</span>
                </div>
                <span className="text-muted-foreground">Ready</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                  <span>Player 2</span>
                </div>
                <span className="text-muted-foreground">Waiting</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Controls: WASD / arrows.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}