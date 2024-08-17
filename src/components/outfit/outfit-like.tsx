"use client";
import { Button } from "@/components/ui/button";
import { TypographyMuted } from "@/components/ui/typography";
import { api, type RouterOutputs } from "@/trpc/react";
import type { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";
import { HeartFilledIcon, HeartIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useDebouncedCallback } from "use-debounce";

export function OutfitLike({
  data,
  user,
}: {
  data: Exclude<RouterOutputs["outfit"]["get"], null>;
  user: KindeUser | null;
}) {
  const [userLiked, setUserLiked] = useState(
    data.likes.find((like) => like.userId === user?.id) !== undefined,
  );
  const [likeCount, setLikeCount] = useState(data.likes.length);
  const router = useRouter();
  const debouncedLikeToggle = useDebouncedCallback((value) => {
    likeOutfit.mutate({ id: value as number });
    setUserLiked(!userLiked);
    setLikeCount(userLiked ? likeCount - 1 : likeCount + 1);
  }, 200);

  const likeOutfit = api.outfit.toggleLike.useMutation({
    onSuccess: (data) => {
      router.refresh();
      if (data) {
        setLikeCount(data.likes.length);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  return (
    <div className="flex items-center justify-center gap-2">
      {user && (
        <Button
          size={"icon"}
          variant={"ghost"}
          className="rounded-full"
          onClick={() => debouncedLikeToggle(data.id)}
        >
          {!userLiked && <HeartIcon />}
          {userLiked && <HeartFilledIcon />}
        </Button>
      )}
      <TypographyMuted>{likeCount} likes</TypographyMuted>
    </div>
  );
}
