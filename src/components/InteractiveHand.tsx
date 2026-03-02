"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { NAIL_CONFIG } from "../constants/soulData";
import { withCloudinaryParams } from "../utils/imageLoader";
import { useHandInteraction } from "../hooks/useHandInteraction";

interface ProfileSummary {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
}

export default function InteractiveHand({
  slots,
  themeId = "default",
  ownerImage = null,
}: {
  slots: (ProfileSummary | null)[];
  themeId?: string;
  ownerImage?: string | null;
}) {
  void themeId;
  const { phase, handlePointerDown, handlePointerUp } = useHandInteraction({
    holdDuration: 2000,
  });

  const handImageSrc =
    phase === "IDLE" ? "/handopen.png" : phase === "PRESSING" ? "/handclose.png" : "/handgoo.png";
  const showNonThumbNails = phase === "PRESSING" || phase === "HELD";
  const showThumbNail = phase === "HELD";

  const nailConfigs = useMemo(() => {
    return NAIL_CONFIG.map((config, index) => {
      const user = slots[index];
      const rawImage = config.id === "thumb" ? ownerImage : user?.image;
      const optimizedImageUrl = rawImage ? withCloudinaryParams(rawImage) : rawImage;
      return { config, user, optimizedImageUrl };
    });
  }, [slots, ownerImage]);

  return (
    <div
      className="relative w-full max-w-[450px] mx-auto overflow-hidden aspect-[3/4] select-none touch-none bg-transparent"
      style={{ WebkitTouchCallout: "none", WebkitUserSelect: "none", userSelect: "none" }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="absolute inset-0"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{
          userSelect: "none",
          WebkitUserSelect: "none",
          WebkitTouchCallout: "none",
          touchAction: "none",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <Image
          src={handImageSrc}
          alt="Hand illustration"
          fill
          className="object-contain opacity-100"
          priority
          quality={100}
          sizes="(max-width: 450px) 100vw, 450px"
          draggable={false}
        />
      </div>

      {nailConfigs.map(({ config, user, optimizedImageUrl }) => {
        const isThumb = config.id === "thumb";
        if (isThumb && !showThumbNail) return null;
        if (!isThumb && (!showNonThumbNails || !user)) return null;
        if (isThumb && !optimizedImageUrl) return null;

        const commonProps = {
          className: "absolute block border-2 border-black overflow-hidden group transition-transform duration-300",
          style: {
            left: `${config.x}%`,
            top: `${config.y}%`,
            width: `${config.w}%`,
            height: `${config.h}%`,
            transform: `translate(-50%, -50%) rotate(${config.r}deg)`,
            zIndex: 110,
            borderRadius: config.br,
            WebkitTouchCallout: "none",
          } as React.CSSProperties,
        };

        if (isThumb) {
          return (
            <div key={config.id} {...commonProps}>
              {optimizedImageUrl && (
                <Image
                  src={optimizedImageUrl}
                  alt="Owner nail"
                  fill
                  className="object-cover"
                  sizes="(max-width: 450px) 8vw, 8vw"
                  loading="lazy"
                />
              )}
            </div>
          );
        }

        return (
          <Link key={config.id} href={`/${user?.username ?? ""}`} {...commonProps}>
            {optimizedImageUrl && (
              <Image
                src={optimizedImageUrl}
                alt={user?.name || ""}
                fill
                className="object-cover"
                sizes="(max-width: 450px) 8vw, 8vw"
                loading="lazy"
              />
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </Link>
        );
      })}
    </div>
  );
}
