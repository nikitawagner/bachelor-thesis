CREATE OR REPLACE PROCEDURE public.apply_closing_strategies()
 LANGUAGE plpgsql
AS $procedure$
DECLARE
    act    RECORD;
    strat  RECORD;

    v_close_price    NUMERIC;
    v_percentage     NUMERIC(5,2);
    v_result         result_type;
    v_days_to_close  INT;
BEGIN
    FOR act IN
        SELECT a.*,
               p.value       AS open_price_value,
               p.fk_company  AS ticker
          FROM actions a
          JOIN prices p ON p.id = a.fk_price
    LOOP
        IF act.action_type = 'hold' THEN
            CONTINUE;
        END IF;

        FOR strat IN
            SELECT * FROM closing_strategy ORDER BY id
        LOOP
            IF strat.id = 6 THEN
                IF act.stop_loss IS NULL OR act.take_profit IS NULL THEN
                    CONTINUE;
                END IF;

                v_close_price := get_stop_take_exit_price(
                    p_ticker         => act.ticker,
                    p_open_date      => act.datetime,
                    p_long_or_short  => act.action_type,
                    p_stop_loss      => act.stop_loss,
                    p_take_profit    => act.take_profit,     
                    p_open_price     => act.open_price_value, 
                    p_price_type     => 'close', 
                    p_time_frame     => 'TIME_SERIES_DAILY'
                );

                IF v_close_price IS NULL THEN
                    CONTINUE;
                END IF;

            ELSE
                IF strat.name LIKE 'day_%_close' THEN
                    v_days_to_close := CAST(
                        split_part(split_part(strat.name, '_', 2), '_', 1) AS INT
                    );
                ELSE
                    v_days_to_close := 1;
                END IF;

                v_close_price := get_nth_trading_day_price(
                    p_ticker      => act.ticker,
                    p_open_date   => act.datetime,
                    p_n           => v_days_to_close,
                    p_price_type  => 'close',
                    p_time_frame  => 'TIME_SERIES_DAILY'
                );

                IF v_close_price IS NULL THEN
                    CONTINUE; 
                END IF;
            END IF;

            IF act.action_type = 'long' THEN
                v_percentage := ROUND(
                    ((v_close_price - act.open_price_value)
                     / act.open_price_value) * 100,
                    2
                );
            ELSIF act.action_type = 'short' THEN
                v_percentage := ROUND(
                    ((act.open_price_value - v_close_price)
                     / act.open_price_value) * 100,
                    2
                );
            END IF;

            v_result := CASE WHEN v_percentage >= 0 THEN 'WIN' ELSE 'LOSS' END;

            INSERT INTO analysis(
                fk_action,
                analysis_type,
                fk_closing_strategy,
                result,
                percentage
            )
            VALUES(
                act.id,
                act.analysis_type,
                strat.id,
                v_result,
                v_percentage
            );
        END LOOP; 
    END LOOP;   
END;
$procedure$
