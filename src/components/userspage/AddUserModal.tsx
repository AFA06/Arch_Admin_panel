import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function AddUserModal({ open, onClose, onSubmit }: AddUserModalProps) {
  const [form, setForm] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    onSubmit(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3 py-2">
          <Input
            name="name"
            placeholder="First Name"
            value={form.name}
            onChange={handleChange}
          />
          <Input
            name="surname"
            placeholder="Last Name"
            value={form.surname}
            onChange={handleChange}
          />
          <Input
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />
          <Input
            name="password"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
          />
          <Input
            name="confirmPassword"
            placeholder="Confirm Password"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add User</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
