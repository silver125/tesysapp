-- Permite que o usuário exclua a própria conta (perfil + auth user + imagens).
-- Prefer SECURITY_doctors_launch.sql para patch completo em produção.

DROP POLICY IF EXISTS "Usuário deleta próprio perfil" ON public.profiles;
CREATE POLICY "Usuário deleta próprio perfil"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado.';
  END IF;

  DELETE FROM storage.objects
  WHERE bucket_id = 'opportunity-images'
    AND (storage.foldername(name))[1] = uid::text;

  DELETE FROM public.profiles WHERE id = uid;
  DELETE FROM auth.users WHERE id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
