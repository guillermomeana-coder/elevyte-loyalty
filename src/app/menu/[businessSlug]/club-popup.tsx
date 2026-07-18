"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Props {
  title: string;
  description: string;
  buttonText: string;
  businessSlug: string;
}

export function ClubPopup({ title, description, buttonText, businessSlug }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="text-center">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground">{description}</p>
        <Button
          className="bg-green-600 hover:bg-green-700 text-white w-full"
          size="lg"
          onClick={() => {
            // TODO: link to registration page
            setOpen(false);
          }}
        >
          {buttonText}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
