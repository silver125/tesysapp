-- Permite que o usuário exclua a própria conta (perfil + auth user).
-- Execute no SQL Editor do Supabase se a exclusão de conta falhar no app.

DROP POLICY IF EXISTS "Usuário deleta próprio perfil" ON public.profiles;
CREATE POLICY "Usuário deleta próprio perfil"
  ON public.profiles
  FOR DELETE
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

  DELETE FROM public.profiles WHERE id = uid;
  DELETE FROM auth.users WHERE id = uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_own_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
