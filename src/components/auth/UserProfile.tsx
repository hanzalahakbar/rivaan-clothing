"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { Button, GlassCard, CardHeader, CardTitle, CardContent } from "@/components/ui";
import { Skeleton } from "@/components/ui/Loading";
import { formatDate } from "@/lib/utils";
import { getUserPhoto, type PhotoWithUrl } from "@/lib/services/photo.service";
import { User, Mail, Calendar, Shield, LogOut, Camera, ImageIcon } from "lucide-react";

export function UserProfile() {
  const { user, profile, isLoading, signOutWithRedirect, isAdmin } = useAuth();
  const [userPhoto, setUserPhoto] = useState<PhotoWithUrl | null>(null);
  const [isLoadingPhoto, setIsLoadingPhoto] = useState(true);

  // Load user's try-on photo
  useEffect(() => {
    async function loadPhoto() {
      if (!user) {
        setIsLoadingPhoto(false);
        return;
      }
      try {
        const photo = await getUserPhoto();
        setUserPhoto(photo);
      } catch (error) {
        console.error("Failed to load photo:", error);
      } finally {
        setIsLoadingPhoto(false);
      }
    }
    loadPhoto();
  }, [user]);

  if (isLoading) {
    return (
      <GlassCard className="w-full max-w-md mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </CardContent>
      </GlassCard>
    );
  }

  if (!user || !profile) {
    return (
      <GlassCard className="w-full max-w-md mx-auto">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            Please sign in to view your profile
          </p>
        </CardContent>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name || "Profile"}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <User className="h-10 w-10 text-primary" aria-hidden="true" />
          )}
        </div>
        <CardTitle className="text-xl">
          {profile.display_name || "User"}
        </CardTitle>
        {isAdmin && (
          <div className="inline-flex items-center gap-1 text-xs text-accent mt-1">
            <Shield className="h-3 w-3" aria-hidden="true" />
            <span>Administrator</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="text-muted-foreground text-xs">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <div>
              <p className="text-muted-foreground text-xs">Member since</p>
              <p className="font-medium">
                {profile.created_at
                  ? formatDate(profile.created_at)
                  : "Unknown"}
              </p>
            </div>
          </div>
        </div>

        {/* Try-On Photo Section */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-3 text-sm mb-3">
            <Camera className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <p className="text-muted-foreground text-xs">Try-On Photo</p>
          </div>

          {isLoadingPhoto ? (
            <Skeleton className="h-20 w-20 rounded-lg" />
          ) : userPhoto ? (
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted">
                <Image
                  src={userPhoto.url}
                  alt="Your try-on photo"
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-foreground">Photo uploaded</p>
                <Link href="/upload">
                  <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                    Change photo
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">No photo uploaded</p>
                <Link href="/upload">
                  <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                    Upload photo for try-on
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signOutWithRedirect()}
          >
            <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
            Sign out
          </Button>
        </div>
      </CardContent>
    </GlassCard>
  );
}
