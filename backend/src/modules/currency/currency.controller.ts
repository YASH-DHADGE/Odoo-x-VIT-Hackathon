import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrencyService } from './currency.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('countries')
  getAllCountries() {
    return this.currencyService.getAllCountriesWithCurrencies();
  }

  @Get('rate')
  @UseGuards(JwtAuthGuard)
  getRate(@Query('from') from: string, @Query('to') to: string) {
    return this.currencyService.getExchangeRate(from, to).then((rate) => ({
      from,
      to,
      rate,
    }));
  }

  @Get('convert')
  @UseGuards(JwtAuthGuard)
  convert(
    @Query('amount') amount: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.currencyService.convertAmount(parseFloat(amount), from, to);
  }
}
