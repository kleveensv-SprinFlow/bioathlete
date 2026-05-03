import { Metadata } from "next";

type Props = {
  params: Promise<{ username: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const username = resolvedParams.username || "athlete";

  const title = `BioAthlete | Profil de ${username}`;
  const description = `Découvrez le profil BioAthlete de ${username} - Athlète de haut niveau (100m, 60m)`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      url: `https://bioathlete.space/u/${username}`,
      images: [
        {
          url: "https://bioathlete.space/og-image.png",
          width: 1200,
          height: 630,
          alt: `BioAthlete | ${username}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://bioathlete.space/og-image.png"],
    },
  };
}

export default function AthleteProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
