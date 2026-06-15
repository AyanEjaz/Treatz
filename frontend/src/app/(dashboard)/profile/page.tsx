"use client";

import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@apollo/client";
import { User, Mail, Calendar, Camera, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { UPDATE_PROFILE_MUTATION } from "@/graphql/mutations/user.mutations";
import { ME_QUERY } from "@/graphql/queries/user.queries";
import { useAuth } from "@/hooks/useAuth";
import { useMyGroups } from "@/hooks/useGroup";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const schema = z.object({
  name: z.string().min(2, "Name min 2 characters"),
});

type FormValues = z.infer<typeof schema>;

function resizeToSquare(file: File, size = 220): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
        resolve(canvas.toDataURL("image/jpeg", 0.88));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}


export default function ProfilePage() {
  const { currentUser } = useAuth();
  const { groups } = useMyGroups();
  const [editing, setEditing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [resizing, setResizing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [updateProfile, { loading }] = useMutation(UPDATE_PROFILE_MUTATION, {
    refetchQueries: [{ query: ME_QUERY }],
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: currentUser?.name ?? "" },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setResizing(true);
    try {
      const dataUrl = await resizeToSquare(file);
      setPreview(dataUrl);
      if (!editing) setEditing(true);
    } catch {
      toast.error("Could not process image");
    } finally {
      setResizing(false);
      e.target.value = "";
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      await updateProfile({
        variables: {
          name: values.name,
          avatar: preview ?? currentUser?.avatar ?? undefined,
        },
      });
      toast.success("Profile updated!");
      setPreview(null);
      setEditing(false);
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const cancelEdit = () => {
    reset({ name: currentUser?.name ?? "" });
    setPreview(null);
    setEditing(false);
  };

  if (!currentUser) return null;

  const displayAvatar = preview ?? currentUser.avatar;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground text-sm mt-1">Tap your photo to change it</p>
      </div>

      {/* Avatar hero */}
      <Card className="animate-fade-up">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col items-center gap-4">

            {/* Clickable avatar */}
            <div className="relative group">
              <div className={cn(
                "h-24 w-24 rounded-2xl overflow-hidden flex items-center justify-center",
                "bg-gradient-to-br from-fuchsia-500 to-rose-500 text-white text-3xl font-bold",
                "shadow-lg shadow-fuchsia-500/20 cursor-pointer",
                "ring-2 ring-transparent group-hover:ring-fuchsia-500/50 transition-all duration-200"
              )}
                onClick={() => fileRef.current?.click()}
              >
                {displayAvatar
                  ? <img src={displayAvatar} alt={currentUser.name} className="h-full w-full object-cover" />
                  : currentUser.name.charAt(0).toUpperCase()
                }
              </div>

              {/* Camera overlay */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={resizing}
                className={cn(
                  "absolute inset-0 rounded-2xl flex items-center justify-center",
                  "bg-black/0 group-hover:bg-black/40 transition-all duration-200",
                  "opacity-0 group-hover:opacity-100"
                )}
              >
                {resizing
                  ? <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Camera className="h-6 w-6 text-white drop-shadow" />
                }
              </button>

              {/* New badge when preview selected */}
              {preview && (
                <div className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center shadow">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
            </div>

            <p className="text-xs text-muted-foreground">Click photo to upload a new one</p>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Name + info */}
            <div className="text-center">
              <h2 className="text-xl font-bold">{currentUser.name}</h2>
              <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mt-1">
                <Mail className="h-3.5 w-3.5" />
                <span>{currentUser.email}</span>
              </div>
              {currentUser.createdAt && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3" />
                  <span>Joined {new Date(currentUser.createdAt).toLocaleDateString("en-PK", { month: "long", year: "numeric" })}</span>
                </div>
              )}
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-1">
                <User className="h-3 w-3" />
                <span>{groups.length} group{groups.length !== 1 ? "s" : ""}</span>
              </div>
            </div>

            <Button variant="outline" size="sm" onClick={() => setEditing((v) => !v)} className="mt-1">
              Edit Name
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit name / save form — shown when editing OR when a new photo is picked */}
      {(editing || preview) && (
        <Card className="animate-fade-up border-fuchsia-500/20">
          <CardContent className="pt-5">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {editing && (
                <div className="space-y-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input id="name" placeholder="Your name" {...register("name")} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
              )}

              {preview && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                  <img src={preview} alt="preview" className="h-10 w-10 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">New photo ready</p>
                    <p className="text-xs text-muted-foreground">Will be saved when you click Save</p>
                  </div>
                  <button type="button" onClick={() => setPreview(null)} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={loading} className="gap-1">
                  <Check className="h-3.5 w-3.5" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={cancelEdit}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 animate-fade-up" style={{ animationDelay: "80ms" }}>
        {[
          { label: "Groups", value: groups.length, color: "text-fuchsia-500" },
          { label: "Username", value: currentUser.username ? `@${currentUser.username}` : "—", color: "text-violet-500" },
          { label: "Since", value: currentUser.createdAt ? new Date(currentUser.createdAt).getFullYear() : "—", color: "text-rose-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl border bg-card p-4 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-200">
            <p className={cn("text-xl font-black truncate", color)}>{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
