CREATE OR REPLACE FUNCTION public.get_nth_trading_day_price(p_ticker text, p_open_date timestamp with time zone, p_n integer, p_price_type price_type, p_time_frame price_time_frame)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_closing_record prices;
BEGIN
    IF p_n < 1 THEN
        p_n := 1;
    END IF;

    SELECT p.*
      INTO v_closing_record
      FROM prices p
     WHERE p.fk_company = p_ticker
       AND p.price_type = p_price_type
       AND p.price_time_frame = p_time_frame
       AND p.datetime > p_open_date
     ORDER BY p.datetime
     LIMIT 1 OFFSET (p_n - 1);

    IF NOT FOUND THEN
       RETURN NULL;
    END IF;

    RETURN v_closing_record.value;
END;
$function$
