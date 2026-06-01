-- Fix plan pour le compte funnymeme43800@gmail.com
-- À exécuter dans le SQL Editor Supabase (Settings → SQL Editor)
--
-- Vérification préalable (optionnel) :
-- SELECT m.id, m.plan, u.email
-- FROM merchants m
-- JOIN auth.users u ON u.id = m.user_id
-- WHERE u.email = 'funnymeme43800@gmail.com';

UPDATE merchants
SET plan = 'essential'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'funnymeme43800@gmail.com'
);

-- Note : la valeur stockée doit être 'essential' (anglais) pour correspondre
-- au type Plan = 'free' | 'essential' | 'pro' dans src/lib/plan-features.ts.
-- Si le webhook Stripe a écrit 'essentiel' (français), la commande ci-dessus
-- corrige également ce problème.
