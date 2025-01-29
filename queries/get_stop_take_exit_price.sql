CREATE OR REPLACE FUNCTION public.get_stop_take_exit_price(p_ticker text, p_open_date 
timestamp with time zone, p_long_or_short action_type, p_stop_loss numeric, p_take_profit numeric, 
p_open_price numeric, p_price_type price_type, p_time_frame price_time_frame)
 RETURNS numeric
 LANGUAGE plpgsql
AS $function$
DECLARE
    rec              prices;
    abs_stop_loss    NUMERIC;
    abs_take_profit  NUMERIC; 
BEGIN
    IF p_long_or_short = 'long' THEN
        abs_stop_loss   := p_open_price * (1 - p_stop_loss);
        abs_take_profit := p_take_profit;
    ELSIF p_long_or_short = 'short' THEN
        abs_stop_loss   := p_open_price * (1 + p_stop_loss);
        abs_take_profit := p_take_profit;
    ELSE
        RETURN NULL;
    END IF;

    FOR rec IN
        SELECT *
          FROM prices
         WHERE fk_company       = p_ticker
           AND price_type       = p_price_type
           AND price_time_frame = p_time_frame
           AND datetime > p_open_date
         ORDER BY datetime
    LOOP
        IF p_long_or_short = 'long' THEN
            IF rec.value <= abs_stop_loss THEN
                RETURN abs_stop_loss;
            END IF;

            IF rec.value >= abs_take_profit THEN
                RETURN abs_take_profit;
            END IF;

        ELSIF p_long_or_short = 'short' THEN
            IF rec.value >= abs_stop_loss THEN
                RETURN abs_stop_loss;
            END IF;

            IF rec.value <= abs_take_profit THEN
                RETURN abs_take_profit;
            END IF;
        END IF;
    END LOOP;

    RETURN NULL;
END;
$function$
