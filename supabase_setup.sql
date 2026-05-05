-- 1. Ajouter la colonne full_name à la table profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 2. Ajouter la colonne profile_id (ou user_id) à la table views pour tracker les vues par utilisateur
-- (Si la table existe déjà sans association, on modifie, sinon on la crée)
CREATE TABLE IF NOT EXISTS public.views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.views ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Si on utilisait une simple colonne count, on s'assure qu'elle existe dans profiles (plus simple et efficace pour ce cas)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS birth_date TEXT;

-- 3. Créer le bucket "media" pour les photos et vidéos
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Mettre en place les politiques de sécurité (RLS) pour le bucket 'media'
-- Permettre à tout le monde de lire les médias
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Permettre aux utilisateurs authentifiés d'uploader
CREATE POLICY "Auth Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Permettre aux utilisateurs de modifier/supprimer leurs propres médias
CREATE POLICY "Auth Update/Delete"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Auth Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text);
